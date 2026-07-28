import type { NodePath, PluginObj } from '@babel/core'
import { types as t } from '@babel/core'

import { shouldTranspile } from '#/devtools/babel-config/should-transpile'
import { getExpressionName } from '#/devtools/babel-plugin-tw/lib/get-expression-name'
import { get } from '#/libs/lodash'

const hookRegex = /^use[A-Z]/

// Generates the identifier for the split-out inner component and its props -
// overridable via the `createUniqIdent` plugin option so tests can get stable,
// human-writable output instead of babel's own (collision-avoiding, but not
// predictable) scope.generateUidIdentifier suffixes.
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
          // rsc/ssr: real `await` is valid here, but a component that also
          // calls a real hook (useState, useEffect, ...) directly is not -
          // split the data-await part out into its own async wrapper
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

// Name of the variable/function/method a function is bound to, e.g. `Xxx` for
// both `function Xxx(){}` and `const Xxx = async () => {}` - undefined for
// anonymous functions (e.g. `export default async function (props) {}`).
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

// The only two places `await use...()` is ever valid: a properly named React
// component (PascalCase - React/JSX only ever treats a capitalized reference
// as a component, never a lowercase or anonymous one) or a custom hook
// composing other hooks (`use` + PascalCase). Anything else - an anonymous
// function, or a named-but-lowercase-non-hook one - is not something this
// framework's own naming conventions would ever resolve as either.
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

// True for `Promise.all(...)` specifically (not any other member call).
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

// The compiler groups independent `await use...()` calls into `Promise.all`
// automatically on the server (see mergeAdjacentIndependentAwaits) - there is
// never a reason to write it by hand: on the server it is redundant (the
// compiler does it for you, or throws if it can't be done safely), and on
// the client every await is stripped identically regardless of grouping.
// Fail the build and point at plain sequential `await use...()` instead.
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
// useFetch...: inject `.dehydrateJsx` into every return, so the client can
// pick the same fetch result back up during hydration instead of re-fetching
// (see hydration.md). Runs once per candidate, before the isServer-specific
// strip/split passes below, on both boundaries - only the shape of what gets
// returned changes here, not whether the await itself ends up sync or split.
// ---------------------------------------------------------------------------

const fetchHookRegex = /^useFetch/

// TODO: only components are supported for now - a hook host has no JSX tree
// of its own to inject a `.dehydrateJsx` marker into, so `await useFetch...()`
// inside a hook is left completely untouched until that is designed.
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

    // destructured (or other pattern) LHS - swap it for a plain temp
    // identifier holding the full result, then recover the original
    // bindings from it as a separate statement right after, so there is
    // still something to call `.dehydrateJsx` on
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

// `await use...()`, or `await Promise.all([use...(), ...])` - the latter
// only ever appears as this transform's own generated output now that
// checkNoExplicitPromiseAll bans writing it by hand, but is still recognized
// here read-only, since the merged output needs to keep working correctly.
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

// A real hook call is any `use...()` not wrapped in one of the shapes above -
// this framework always awaits its own async hooks, so an un-awaited one is
// necessarily a real React/DOM hook (useState, useEffect, ...). A statement
// can still legitimately contain further `await use...()`s of its own (e.g.
// once the leading run has already stopped for an unrelated reason, below) -
// skip those instead of miscounting them as real. Returns the offending
// CallExpression path (for a code-frame error) if found.
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

// A further `await use...()` that didn't make it into the leading run (e.g.
// a plain statement, or a real hook, sits before it) can't be moved into the
// inner component either - it would stay non-async but still await. Returns
// the offending AwaitExpression path (for a code-frame error) if found.
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

// Extracts { lhs, init, names } from a top-level `const <pattern> = await
// use...()` (or `await Promise.all([...])`) statement - `init` is the value
// unwrapped from its own `await`, ready to become one element of a bigger
// `Promise.all([...])` array (nesting an existing Promise.all rather than
// flattening it is fine - still fully parallel, just one array level deeper).
// PatternLike (not the wider LVal) - all t.arrayPattern needs, and all a
// `const` declarator's id ever practically is (never a TSParameterProperty,
// which only occurs in function params)
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

// True if `s` doesn't reference any name in `declaredSoFar` - i.e. it did not
// need anything resolved by an earlier `await use...()` decl, so it could
// have started resolving at the same time as any other such "root".
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

// A plain `const <pattern> = <name>` where `<name>` is already something an
// earlier await-hook decl resolved - e.g. the temp var injectDehydrateJsx
// introduces for a destructured `useFetch...()` result, re-destructured right
// after it. Not a new async dependency, so it doesn't break adjacency for
// merge/waterfall purposes below - but the names it binds are still derived
// from that earlier decl, and must count as resolved for anything checked
// after it (otherwise a real dependency on one of those names would go
// undetected, and could get merged into a parallel Promise.all incorrectly).
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

// Combines a run of statements (each already confirmed to be an independent
// `AwaitHookDecl`) into one `const [pat1, pat2, ...] = await Promise.all([
// init1, init2, ...])` - each original LHS pattern (identifier, object, or
// array) just becomes one element of the merged array pattern.
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

// Auto-combines 2+ *adjacent* independent `await use...()` decls into a
// single `await Promise.all([...])` - always safe, since nothing changes
// position: there is no statement between them whose ordering could matter.
// Re-scans from scratch after each merge (indices shift), so this is O(n^2)
// in the pathological case, but function bodies are small.
const mergeAdjacentIndependentAwaits = (
  bodyPath: NodePath<t.BlockStatement>,
) => {
  for (;;) {
    const stmts = bodyPath.get('body')
    const declaredSoFar = new Set<string>()
    // the run of statement paths merged so far - built from actual decls
    // only, so a transparent alias sitting between two decls (see
    // getTransparentAliasNames) never becomes part of the merged group,
    // even though it doesn't break adjacency either
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

// Scans every top-level `const <pattern> = await use...()` statement left
// after merging, in order (regardless of what other statements sit between
// them) - each one that does not reference a name bound by an *earlier* one
// of these is a "root". Two or more roots at this point means fixing them
// would require actually moving code across something in between (a plain
// statement, or a real dependency) - not safe to do automatically, so fail
// the build and point at the first avoidable one instead of silently
// accepting a slower-than-necessary waterfall.
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

  // auto-combine trivially safe waterfalls first (adjacent + independent),
  // so the leading-run scan below sees the merged shape - e.g. two adjacent
  // independent awaits that just got combined are now one leading decl, not
  // two - then fail the build for anything left that would need an actual
  // reorder to fix (see mergeAdjacentIndependentAwaits / checkForWaterfall)
  mergeAdjacentIndependentAwaits(bodyPath)
  const stmts = bodyPath.get('body')
  checkForWaterfall(stmts)

  // Real hook calls before this function's own first await are always safe -
  // nothing has suspended yet, so React's hook dispatcher (assuming this
  // function, or an unbroken synchronous call chain leading to it, is what
  // React is actually calling) is still valid at that point. A real hook
  // *after* the first await is unconditionally broken - confirmed
  // empirically (react-dom/server + renderToPipeableStream): the dispatcher
  // does not survive crossing an await, no matter what the await depends on
  // or how deeply the real hook call is nested in helper calls. See
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

  // splitting renders the inner half as JSX, which only makes sense for a
  // component - a hook has no tree to split into, and there is no other way
  // to make this safe, so fail the build instead of leaving it broken.
  if (isHookHost) {
    throw unsafeRealHook.buildCodeFrameError(
      "This hook calls a real hook (useState, useEffect, ...) after its own `await use...()` - once an async function crosses an await, React's hook dispatcher is no longer valid there, so this throws at runtime. Move this call before the first `await use...()` in this hook instead, or move the real-hook logic into a separate component.",
    )
  }

  // leading run of `const <pattern> = await use...()` becomes the wrapper's
  // body - the LHS can be any pattern (plain identifier, or a destructured
  // object/array, e.g. `const { a, b } = await useSomething()`), since the
  // statement itself is kept verbatim in the wrapper either way; all of it
  // just needs a name to forward each bound value to the inner component by
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

  // a real hook after the first await means a split is unavoidable - but any
  // further `await use...()` outside the leading run can't be moved into the
  // (non-async) inner component either. Fail the build instead of silently
  // emitting that - see "Splitting a component" in docs/async-components.md.
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

  // a component only ever receives a single props argument - this doesn't
  // apply to a hook host (already returned above), which can take anything
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

  // wrapper: swap the destructured param for the fresh plain identifier, then
  // recover the original bindings from it, then keep the data declarations,
  // then render the inner component with the resolved data (renamed to avoid
  // clashing with the original props)
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
    // merge the resolved data props into a clone of the original pattern
    // (cloned since the wrapper's own injected statement keeps the original),
    // inserted before any trailing rest element, which must stay last
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

// Resolve the statement to insert the split-out inner component after, and
// the name to base its generated identifier on - only plain `function Xxx(){}`
// and `const Xxx = async () => {}` / `const Xxx = async function () {}` are
// supported, so the original binding keeps pointing at the wrapper untouched.
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
