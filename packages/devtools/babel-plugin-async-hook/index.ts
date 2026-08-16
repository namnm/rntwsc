import type { NodePath, PluginObj } from '@babel/core'
import { types as t } from '@babel/core'

import { shouldTranspile } from '#/devtools/babel-config/should-transpile'
import { getExpressionName } from '#/devtools/babel-plugin-tw/lib/get-expression-name'
import { get } from '#/libs/lodash'

const hookRegex = /^use[A-Z]/

// Identifier factory for the split-out inner component and its props.
// See "createUniqIdent" in contribution/async-components.md.
export type CreateUniqIdent = (
  scope: NodePath<t.Function>['scope'],
  name: string,
) => t.Identifier
const createUniqIdentDefault: CreateUniqIdent = (scope, name) =>
  scope.generateUidIdentifier(name)

export const asyncHookPlugin: PluginObj = {
  visitor: {
    // use program path to get plugin pass and perform some checks before traverse
    // also prioritize this plugin over others such as react compiler
    Program: (programPath, pluginPass) => {
      if (!shouldTranspile(pluginPass.filename)) {
        return
      }
      const isServer = get(pluginPass.opts, 'isServer')
      const createUniqIdent: CreateUniqIdent =
        get(pluginPass.opts, 'createUniqIdent') || createUniqIdentDefault

      // collect candidates first, mutate after - splitting a component inserts
      // a new sibling statement, which would confuse an in-progress traversal
      const candidates = new Set<NodePath<t.Function>>()
      programPath.traverse({
        CallExpression: p => {
          const parentFn = getHookOwnerFn(p)
          if (parentFn) {
            candidates.add(parentFn)
          }
        },
      })

      candidates.forEach(parentFn => {
        injectDehydrateJsx(parentFn, createUniqIdent)
        if (isServer) {
          // rsc/ssr: keep await, split out real-hook usage if needed - see
          // contribution/async-components.md
          trySplitServerComponent(parentFn, createUniqIdent)
        } else {
          // browser/rn: no real async component support, strip to sync
          stripToSync(parentFn)
        }
      })
    },
  },
}

const supportedFnTypes = (
  p: NodePath<t.Function>,
): p is NodePath<
  | t.FunctionDeclaration
  | t.FunctionExpression
  | t.ArrowFunctionExpression
  | t.ObjectMethod
  | t.ClassMethod
> =>
  p.isFunctionDeclaration() ||
  p.isFunctionExpression() ||
  p.isArrowFunctionExpression() ||
  p.isObjectMethod() ||
  p.isClassMethod()

const isMethod = (
  p: NodePath<t.Function>,
): p is NodePath<t.ObjectMethod | t.ClassMethod> =>
  p.isObjectMethod() || p.isClassMethod()

// Name of the variable/function/method a function is bound to.
// undefined for an anonymous function.
const resolveFnName = (p: NodePath<t.Function>): string | undefined => {
  if (p.isFunctionDeclaration()) {
    return p.node.id?.name
  }
  if (
    (p.isArrowFunctionExpression() || p.isFunctionExpression()) &&
    p.parentPath.isVariableDeclarator() &&
    t.isIdentifier(p.parentPath.node.id)
  ) {
    return p.parentPath.node.id.name
  }
  if (
    (p.isObjectMethod() || p.isClassMethod()) &&
    !p.node.computed &&
    t.isIdentifier(p.node.key)
  ) {
    return p.node.key.name
  }
  return undefined
}

// `await use...()` is only ever valid in a PascalCase component or a
// use-prefixed hook - see "babel-plugin-async-hook" in
// contribution/async-components.md.
const isValidHostName = (name: string | undefined): boolean =>
  !!name && (/^[A-Z]/.test(name) || hookRegex.test(name))

const getHookOwnerFn = (
  p: NodePath<t.CallExpression>,
): NodePath<t.Function> | undefined => {
  const callee = p.node.callee
  if (!t.isExpression(callee)) {
    return undefined
  }
  const calleeName = getExpressionName(callee)
  if (!calleeName || !hookRegex.test(calleeName)) {
    return undefined
  }

  const parentFn = p.getFunctionParent()
  if (!parentFn || !parentFn.node.async || !supportedFnTypes(parentFn)) {
    return undefined
  }
  if (isMethod(parentFn)) {
    throw p.buildCodeFrameError(
      `\`await ${calleeName}()\` is inside an object/class method - this is not supported, since there is nowhere to insert a split-out sibling method next to it. Use a plain function/arrow component or hook instead (\`const Xxx = async () => {}\`).`,
    )
  }
  const hostName = resolveFnName(parentFn)
  if (!isValidHostName(hostName)) {
    throw p.buildCodeFrameError(
      hostName
        ? `\`await ${calleeName}()\` is inside \`${hostName}\`, which is not a validly named component (PascalCase) or hook (use...) - rename it, or move this call into one.`
        : `\`await ${calleeName}()\` is inside an anonymous function - give it a component name (PascalCase) or a hook name (use...) instead.`,
    )
  }
  return parentFn
}

// True only for `Promise.all(...)`, not any other member call.
const isPromiseAllCall = (expr: t.Expression): boolean => {
  if (!t.isCallExpression(expr) || !t.isMemberExpression(expr.callee)) {
    return false
  }
  const { object, property, computed } = expr.callee
  return (
    t.isIdentifier(object, {
      name: 'Promise',
    }) &&
    t.isIdentifier(property, {
      name: 'all',
    }) &&
    !computed
  )
}

// Hand-written `await Promise.all(...)` is always redundant - see
// "Independent awaits are combined automatically" in async-components.md.
const checkNoExplicitPromiseAll = (parentFn: NodePath<t.Function>) => {
  parentFn.traverse({
    Function: inner => {
      if (inner === parentFn) {
        return
      }
      inner.skip()
    },
    AwaitExpression: awaitPath => {
      if (isPromiseAllCall(awaitPath.node.argument)) {
        throw awaitPath.buildCodeFrameError(
          'Do not write `await Promise.all(...)` by hand - write separate `await use...()` calls instead; independent ones are grouped into Promise.all for you automatically.',
        )
      }
    },
  })
}

// ---------------------------------------------------------------------------
// useFetch...: inject `.dehydrateJsx` into every return for hydration.
// See "injectDehydrateJsx" in contribution/async-components.md.
// ---------------------------------------------------------------------------

const fetchHookRegex = /^useFetch/

// TODO: components only for now - see "injectDehydrateJsx" in
// contribution/async-components.md.
const injectDehydrateJsx = (
  parentFn: NodePath<t.Function>,
  createUniqIdent: CreateUniqIdent,
) => {
  if (!t.isBlockStatement(parentFn.node.body)) {
    return
  }
  const hostName = resolveFnName(parentFn)
  if (!!hostName && hookRegex.test(hostName)) {
    return
  }

  const bodyPath = parentFn.get('body') as NodePath<t.BlockStatement>
  const resultNames: string[] = []

  for (const stmt of bodyPath.get('body')) {
    if (!stmt.isVariableDeclaration() || stmt.node.kind !== 'const') {
      continue
    }
    const [decl, ...rest] = stmt.node.declarations
    if (rest.length || !decl || !decl.init || !t.isAwaitExpression(decl.init)) {
      continue
    }
    const arg = decl.init.argument
    if (!t.isCallExpression(arg) || !t.isExpression(arg.callee)) {
      continue
    }
    const calleeName = getExpressionName(arg.callee)
    if (!calleeName || !fetchHookRegex.test(calleeName)) {
      continue
    }

    if (t.isIdentifier(decl.id)) {
      resultNames.push(decl.id.name)
      continue
    }

    // destructured LHS - swap for a temp identifier, then re-destructure
    // it right after, so there is something to call `.dehydrateJsx` on
    const base = calleeName.charAt(3).toLowerCase() + calleeName.slice(4)
    const resultId = createUniqIdent(parentFn.scope, base)
    const originalPattern = decl.id
    stmt.node.declarations = [t.variableDeclarator(resultId, decl.init)]
    stmt.insertAfter(
      t.variableDeclaration('const', [
        t.variableDeclarator(originalPattern, t.identifier(resultId.name)),
      ]),
    )
    resultNames.push(resultId.name)
  }

  if (!resultNames.length) {
    return
  }

  parentFn.traverse({
    Function: inner => {
      if (inner === parentFn) {
        return
      }
      inner.skip()
    },
    ReturnStatement: returnPath => {
      const original = returnPath.node.argument
      const children: (
        t.JSXElement | t.JSXFragment | t.JSXExpressionContainer
      )[] = []
      if (original) {
        children.push(
          t.isJSXElement(original) || t.isJSXFragment(original)
            ? original
            : t.jsxExpressionContainer(original),
        )
      }
      resultNames.forEach(name => {
        children.push(
          t.jsxExpressionContainer(
            t.memberExpression(
              t.identifier(name),
              t.identifier('dehydrateJsx'),
            ),
          ),
        )
      })
      returnPath.node.argument = t.jsxFragment(
        t.jsxOpeningFragment(),
        t.jsxClosingFragment(),
        children,
      )
    },
  })
}

// ---------------------------------------------------------------------------
// browser/rn: strip `await use...()` down to a plain sync call
// ---------------------------------------------------------------------------

const stripToSync = (parentFn: NodePath<t.Function>) => {
  checkNoExplicitPromiseAll(parentFn)

  parentFn.traverse({
    Function: inner => {
      if (inner === parentFn) {
        return
      }
      inner.skip()
    },
    AwaitExpression: stripAwaitOrYield,
    YieldExpression: stripAwaitOrYield,
  })

  parentFn.node.async = false
}

const stripAwaitOrYield = (
  p: NodePath<t.YieldExpression | t.AwaitExpression>,
) => {
  const arg = p.node.argument
  const invalid = (): never => {
    throw p.buildCodeFrameError('Only support `await use...()`')
  }
  if (!arg) {
    return invalid()
  }
  if (t.isCallExpression(arg) && t.isExpression(arg.callee)) {
    const name = getExpressionName(arg.callee)
    if (name && hookRegex.test(name)) {
      p.replaceWith(arg)
      return
    }
  }
  return invalid()
}

// ---------------------------------------------------------------------------
// rsc/ssr: split a component that mixes `await use...()` with a real hook
// ---------------------------------------------------------------------------

// Matches `await use...()` or an already-merged `await Promise.all([...])`.
// See "babel-plugin-async-hook" in contribution/async-components.md.
const isAwaitedHookCall = (expr: t.AwaitExpression): boolean => {
  const arg = expr.argument
  if (t.isCallExpression(arg) && t.isExpression(arg.callee)) {
    const name = getExpressionName(arg.callee)
    if (name && hookRegex.test(name)) {
      return true
    }
  }
  return isPromiseAllCall(arg)
}

// An un-awaited use...() is necessarily a real hook - see
// "Implementation notes" in contribution/async-components.md.
// Returns the offending call path, if found.
const findOwnHookCall = (
  stmt: NodePath<t.Statement>,
): NodePath<t.CallExpression> | undefined => {
  let found: NodePath<t.CallExpression> | undefined
  stmt.traverse({
    Function: inner => inner.skip(),
    AwaitExpression: awaitPath => {
      if (isAwaitedHookCall(awaitPath.node)) {
        awaitPath.skip()
      }
    },
    CallExpression: cp => {
      if (found) {
        return
      }
      const callee = cp.node.callee
      if (!t.isExpression(callee)) {
        return
      }
      const name = getExpressionName(callee)
      if (name && hookRegex.test(name)) {
        found = cp
      }
    },
  })
  return found
}

// A further awaited hook outside the leading run can't be moved into the
// (non-async) inner component - see contribution/async-components.md.
const findOwnAwaitedHookCall = (
  stmt: NodePath<t.Statement>,
): NodePath<t.AwaitExpression> | undefined => {
  let found: NodePath<t.AwaitExpression> | undefined
  stmt.traverse({
    Function: inner => inner.skip(),
    AwaitExpression: awaitPath => {
      if (!found && isAwaitedHookCall(awaitPath.node)) {
        found = awaitPath
      }
    },
  })
  return found
}

// Extracts { lhs, init, names } from a top-level await-hook declaration.
// See "Implementation notes" in contribution/async-components.md.
type AwaitHookDecl = { lhs: t.PatternLike; init: t.Expression; names: string[] }
const getAwaitHookDecl = (
  s: NodePath<t.Statement>,
): AwaitHookDecl | undefined => {
  if (!s.isVariableDeclaration() || s.node.kind !== 'const') {
    return undefined
  }
  const [decl, ...rest] = s.node.declarations
  if (rest.length || !decl || !decl.init) {
    return undefined
  }
  if (!t.isAwaitExpression(decl.init) || !isAwaitedHookCall(decl.init)) {
    return undefined
  }
  const names = Object.keys(t.getBindingIdentifiers(decl.id))
  if (!names.length) {
    return undefined
  }
  return {
    lhs: decl.id as t.PatternLike,
    init: decl.init.argument,
    names,
  }
}

// True if `s` references no name resolved by an earlier decl in the run.
const isIndependentDecl = (
  s: NodePath<t.Statement>,
  declaredSoFar: Set<string>,
): boolean => {
  const initPath = s.get('declarations.0.init') as NodePath<t.AwaitExpression>
  let referencesEarlier = false
  initPath.traverse({
    Identifier: idPath => {
      if (declaredSoFar.has(idPath.node.name)) {
        referencesEarlier = true
      }
    },
  })
  return !referencesEarlier
}

// A re-destructure of an earlier decl's temp var (see injectDehydrateJsx) -
// see "injectDehydrateJsx" in contribution/async-components.md.
const getTransparentAliasNames = (
  s: NodePath<t.Statement>,
  declaredSoFar: Set<string>,
): string[] | undefined => {
  if (!s.isVariableDeclaration() || s.node.kind !== 'const') {
    return undefined
  }
  const [decl, ...rest] = s.node.declarations
  if (rest.length || !decl || !decl.init || !t.isIdentifier(decl.init)) {
    return undefined
  }
  if (!declaredSoFar.has(decl.init.name)) {
    return undefined
  }
  return Object.keys(t.getBindingIdentifiers(decl.id))
}

// Combines a run of independent AwaitHookDecls into one
// `const [pat1, pat2, ...] = await Promise.all([init1, init2, ...])`.
const mergeIntoPromiseAll = (group: NodePath<t.Statement>[]) => {
  const decls = group.map(s => getAwaitHookDecl(s)!)
  const merged = t.variableDeclaration('const', [
    t.variableDeclarator(
      t.arrayPattern(decls.map(d => d.lhs)),
      t.awaitExpression(
        t.callExpression(
          t.memberExpression(t.identifier('Promise'), t.identifier('all')),
          [t.arrayExpression(decls.map(d => d.init))],
        ),
      ),
    ),
  ])
  for (let i = group.length - 1; i >= 1; i--) {
    group[i].remove()
  }
  group[0].replaceWith(merged)
}

// Auto-combines adjacent independent await-hook decls into Promise.all.
// See "babel-plugin-async-hook" in contribution/async-components.md.
const mergeAdjacentIndependentAwaits = (
  bodyPath: NodePath<t.BlockStatement>,
) => {
  for (;;) {
    const stmts = bodyPath.get('body')
    const declaredSoFar = new Set<string>()
    // the run of statement paths merged so far - decls only, a transparent
    // alias never joins the group (see getTransparentAliasNames)
    let run: NodePath<t.Statement>[] = []
    let merged = false

    const flush = (): boolean => {
      if (run.length < 2) {
        run = []
        return false
      }
      mergeIntoPromiseAll(run)
      return true
    }

    for (const s of stmts) {
      const aliasNames = getTransparentAliasNames(s, declaredSoFar)
      if (aliasNames) {
        aliasNames.forEach(n => declaredSoFar.add(n))
        continue
      }

      const decl = getAwaitHookDecl(s)
      const isRoot = !!decl && isIndependentDecl(s, declaredSoFar)

      if (decl && isRoot) {
        run.push(s)
      } else if (flush()) {
        merged = true
        break
      }

      if (decl) {
        decl.names.forEach(n => declaredSoFar.add(n))
      }
    }

    if (!merged && flush()) {
      merged = true
    }

    if (!merged) {
      return
    }
  }
}

// A second independent "root" after merging means an actual reorder is
// needed - see "Independent awaits are combined automatically" in
// async-components.md.
const checkForWaterfall = (stmts: NodePath<t.Statement>[]) => {
  const declaredSoFar = new Set<string>()
  let hasRoot = false
  for (const s of stmts) {
    const aliasNames = getTransparentAliasNames(s, declaredSoFar)
    if (aliasNames) {
      aliasNames.forEach(n => declaredSoFar.add(n))
      continue
    }

    const decl = getAwaitHookDecl(s)
    if (!decl) {
      continue
    }
    if (isIndependentDecl(s, declaredSoFar)) {
      if (hasRoot) {
        throw s.buildCodeFrameError(
          'This `await use...()` does not depend on the earlier independent one(s) above, but something sits between them - move it up so it is adjacent, and it will be auto-combined into `await Promise.all([...])`.',
        )
      }
      hasRoot = true
    }
    decl.names.forEach(n => declaredSoFar.add(n))
  }
}

const trySplitServerComponent = (
  parentFn: NodePath<t.Function>,
  createUniqIdent: CreateUniqIdent,
) => {
  if (!t.isBlockStatement(parentFn.node.body)) {
    return
  }
  checkNoExplicitPromiseAll(parentFn)

  // getHookOwnerFn already threw for anything else, so this is guaranteed to
  // be either a validly named component (PascalCase) or a hook (use...)
  const hostName = resolveFnName(parentFn)
  const isHookHost = !!hostName && hookRegex.test(hostName)

  const bodyPath = parentFn.get('body') as NodePath<t.BlockStatement>

  // merge safe waterfalls first so the leading-run scan below sees the
  // merged shape, then fail the build for anything left needing a reorder
  mergeAdjacentIndependentAwaits(bodyPath)
  const stmts = bodyPath.get('body')
  checkForWaterfall(stmts)

  // A real hook is safe only before this function's own first await - see
  // "Splitting a component" in docs/async-components.md.
  const firstAwaitIdx = stmts.findIndex(s => !!findOwnAwaitedHookCall(s))
  if (firstAwaitIdx === -1) {
    return // no awaited hook at all - nothing for this transform to do
  }
  const unsafeRealHook = stmts
    .slice(firstAwaitIdx + 1)
    .map(findOwnHookCall)
    .find((p): p is NodePath<t.CallExpression> => !!p)
  if (!unsafeRealHook) {
    return // no real hook after the first await - safe as originally written
  }

  // a hook has no JSX tree to split into, so this can't be made safe
  if (isHookHost) {
    throw unsafeRealHook.buildCodeFrameError(
      "This hook calls a real hook (useState, useEffect, ...) after its own `await use...()` - once an async function crosses an await, React's hook dispatcher is no longer valid there, so this throws at runtime. Move this call before the first `await use...()` in this hook instead, or move the real-hook logic into a separate component.",
    )
  }

  // leading run of `const <pattern> = await use...()` becomes the wrapper's
  // body, kept verbatim - see "babel-plugin-async-hook" in
  // contribution/async-components.md.
  const dataDecls: { names: string[]; node: t.VariableDeclaration }[] = []
  let idx = 0
  for (; idx < stmts.length; idx++) {
    const s = stmts[idx]
    if (!s.isVariableDeclaration() || s.node.kind !== 'const') {
      break
    }
    const [decl, ...rest] = s.node.declarations
    if (rest.length || !decl || !decl.init) {
      break
    }
    if (!t.isAwaitExpression(decl.init) || !isAwaitedHookCall(decl.init)) {
      break
    }
    const names = Object.keys(t.getBindingIdentifiers(decl.id))
    if (!names.length) {
      break
    }
    dataDecls.push({
      names,
      node: s.node,
    })
  }

  // a further awaited hook outside the leading run can't be moved into the
  // inner component either - see "Splitting a component" in async-components.md.
  const restPaths = stmts.slice(idx)
  for (const stmt of restPaths) {
    const strayAwait = findOwnAwaitedHookCall(stmt)
    if (!strayAwait) {
      continue
    }
    throw strayAwait.buildCodeFrameError(
      'This `await use...()` is separated from the leading run of `await use...()` declarations by another statement, so it cannot be moved into the split-out wrapper. Move it up next to the other awaited hooks if nothing in between depends on it, or split this component by hand instead.',
    )
  }

  if (!dataDecls.length || idx >= stmts.length) {
    throw parentFn.buildCodeFrameError(
      `\`${hostName}\` mixes \`await use...()\` with a real hook, but the leading part of the function is not a clean, contiguous run of \`const x = await use...()\` declarations starting from the top - split this component by hand instead.`,
    )
  }

  // a component only ever receives a single props argument - not enforced
  // for a hook host, which already returned above
  const params = parentFn.node.params
  if (params.length > 1) {
    throw parentFn.buildCodeFrameError(
      `\`${hostName}\` awaits a hook but takes more than one parameter - a component only ever receives a single props argument. Remove the extra parameter(s) (e.g. drop \`forwardRef\` - \`ref\` is a regular prop since React 19), or rename this to a hook (use...) if it truly takes more than one argument.`,
    )
  }
  const param = params[0]
  let paramId: t.Identifier | undefined
  let originalPattern: t.ObjectPattern | undefined
  if (t.isIdentifier(param)) {
    paramId = param
  } else if (t.isObjectPattern(param)) {
    originalPattern = param
    paramId = createUniqIdent(parentFn.scope, 'props')
  } else if (param) {
    throw parentFn.buildCodeFrameError(
      `\`${hostName}\`'s parameter must be a plain identifier or an object pattern (props destructuring) to use \`await use...()\` - this parameter shape is not supported.`,
    )
  }

  const wrapper = resolveWrapper(parentFn)
  if (!wrapper) {
    return
  }

  const baseName = wrapper.name || 'Component'
  const innerId = createUniqIdent(parentFn.scope, baseName)
  const dataNames = dataDecls.flatMap(d => d.names)
  const propIds = dataNames.map(name => createUniqIdent(parentFn.scope, name))

  // wrapper: recover original param bindings, keep the data decls, then
  // render the inner component with the resolved data - see the Button
  // example in docs/async-components.md.
  const wrapperPrefix: t.Statement[] = []
  if (originalPattern && paramId) {
    parentFn.node.params[0] = paramId
    wrapperPrefix.push(
      t.variableDeclaration('const', [
        t.variableDeclarator(originalPattern, t.identifier(paramId.name)),
      ]),
    )
  }

  const jsxAttrs: (t.JSXAttribute | t.JSXSpreadAttribute)[] = dataNames.map(
    (name, i) =>
      t.jsxAttribute(
        t.jsxIdentifier(propIds[i].name),
        t.jsxExpressionContainer(t.identifier(name)),
      ),
  )
  if (paramId) {
    jsxAttrs.push(t.jsxSpreadAttribute(t.identifier(paramId.name)))
  }
  parentFn.node.body.body = [
    ...wrapperPrefix,
    ...dataDecls.map(d => d.node),
    t.returnStatement(
      t.jsxElement(
        t.jsxOpeningElement(t.jsxIdentifier(innerId.name), jsxAttrs, true),
        null,
        [],
        true,
      ),
    ),
  ]

  // inner: original rest of the body, receiving the resolved data back as
  // props destructured under their original names
  const innerProps: (t.ObjectProperty | t.RestElement)[] = dataNames.map(
    (name, i) =>
      t.objectProperty(t.identifier(propIds[i].name), t.identifier(name)),
  )
  let innerParam: t.ObjectPattern
  if (originalPattern) {
    // merge resolved data props into a clone of the original pattern,
    // before any trailing rest element - the wrapper keeps the original
    const cloned = t.cloneNode(originalPattern, true)
    const restIdx = cloned.properties.findIndex(p => t.isRestElement(p))
    if (restIdx === -1) {
      cloned.properties.push(...innerProps)
    } else {
      cloned.properties.splice(restIdx, 0, ...innerProps)
    }
    innerParam = cloned
  } else {
    if (paramId) {
      innerProps.push(t.restElement(t.identifier(paramId.name)))
    }
    innerParam = t.objectPattern(innerProps)
  }
  const innerBody = t.blockStatement(restPaths.map(p => p.node))

  if (wrapper.kind === 'declaration') {
    wrapper.insertAfterPath.insertAfter(
      t.functionDeclaration(innerId, [innerParam], innerBody),
    )
  } else {
    const innerFn =
      wrapper.kind === 'arrow'
        ? t.arrowFunctionExpression([innerParam], innerBody)
        : t.functionExpression(null, [innerParam], innerBody)
    wrapper.insertAfterPath.insertAfter(
      t.variableDeclaration('const', [t.variableDeclarator(innerId, innerFn)]),
    )
  }
}

type Wrapper =
  | {
      kind: 'declaration'
      name: string | undefined
      insertAfterPath: NodePath<t.Statement>
    }
  | {
      kind: 'arrow' | 'expression'
      name: string
      insertAfterPath: NodePath<t.Statement>
    }

// Resolve where to insert the split-out inner component, and its base name.
// Only two wrapper shapes are supported - see "Implementation notes" in
// contribution/async-components.md.
const resolveWrapper = (
  parentFn: NodePath<t.Function>,
): Wrapper | undefined => {
  if (parentFn.isFunctionDeclaration()) {
    return {
      kind: 'declaration',
      name: resolveFnName(parentFn),
      insertAfterPath: parentFn,
    }
  }

  if (
    (parentFn.isArrowFunctionExpression() || parentFn.isFunctionExpression()) &&
    parentFn.parentPath.isVariableDeclarator()
  ) {
    const name = resolveFnName(parentFn)
    const declPath = parentFn.parentPath.parentPath
    if (!name || !declPath.isVariableDeclaration()) {
      return undefined
    }
    return {
      kind: parentFn.isArrowFunctionExpression() ? 'arrow' : 'expression',
      name,
      insertAfterPath: declPath,
    }
  }

  return undefined
}
