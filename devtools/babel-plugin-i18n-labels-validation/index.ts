import type { ConfigAPI, NodePath, PluginObj } from '@babel/core'
import { parse, traverse, types as t } from '@babel/core'
import { z } from 'zod'

import { shouldTranspile } from 'rntwsc/devtools/babel-config/should-transpile'
import { fs } from 'rntwsc/devtools/fs'

// ============================================================
// Types
// ============================================================

const labelsSchema = z.record(z.string(), z.record(z.string(), z.string()))

export type Labels = z.infer<typeof labelsSchema>

export type MissingKey = {
  namespace: string
  key: string
  file: string
  line: number
}

export type UnusedKey = {
  namespace: string
  key: string
}

export type ValidationResult = {
  missing: MissingKey[]
  unused: UnusedKey[]
}

export type PluginOptions = {
  // reference locale labels: namespace -> { key: value }
  labels: Labels
}

export type ScanOptions = PluginOptions & {
  files: string[]
}

// ============================================================
// Core: collect bindings + usages from one AST
// ============================================================

const USE_TRANSLATION = 'useTranslationUntyped'

type UsageRecord = {
  namespace: string
  key: string
  file: string
  line: number
}

const resolveCallExpr = (
  node:
    | t.Expression
    | t.SpreadElement
    | t.JSXNamespacedName
    | t.ArgumentPlaceholder
    | null
    | undefined,
): t.CallExpression | null => {
  if (!node || !t.isExpression(node)) {
    return null
  }
  if (t.isCallExpression(node)) {
    return node
  }
  if (t.isAwaitExpression(node) && t.isCallExpression(node.argument)) {
    return node.argument
  }
  return null
}

const isTranslationCall = (call: t.CallExpression): string | null => {
  if (
    !t.isIdentifier(call.callee, {
      name: USE_TRANSLATION,
    })
  ) {
    return null
  }
  const arg = call.arguments[0]
  if (!t.isStringLiteral(arg)) {
    return null
  }
  return arg.value
}

const collectBindings = (
  path: NodePath<t.VariableDeclarator>,
  bindingNs: Map<object, string>,
) => {
  const init = path.node.init
  const id = path.node.id

  // Pattern 1: const t = await useTranslationUntyped('ns')
  const directCall = resolveCallExpr(init)
  if (directCall) {
    const ns = isTranslationCall(directCall)
    if (ns && t.isIdentifier(id)) {
      const binding = path.scope.getBinding(id.name)
      if (binding) {
        bindingNs.set(binding, ns)
      }
      return
    }
  }

  // Pattern 2: const [t, tThemes] = await Promise.all([useTranslationUntyped('a'), useTranslationUntyped('b')])
  if (!t.isArrayPattern(id)) {
    return
  }

  const awaitedCall = resolveCallExpr(init)
  if (!awaitedCall) {
    return
  }

  const { callee, arguments: args } = awaitedCall
  const isPromiseAll =
    t.isMemberExpression(callee) &&
    t.isIdentifier(callee.object, {
      name: 'Promise',
    }) &&
    t.isIdentifier(callee.property, {
      name: 'all',
    }) &&
    !callee.computed
  if (!isPromiseAll) {
    return
  }

  const arr = args[0]
  if (!t.isArrayExpression(arr)) {
    return
  }

  id.elements.forEach((elem, i) => {
    if (!elem || !t.isIdentifier(elem)) {
      return
    }
    const ns = isTranslationCall(
      resolveCallExpr(arr.elements[i]) || ({} as any),
    )
    if (!ns) {
      return
    }
    const binding = path.scope.getBinding(elem.name)
    if (binding) {
      bindingNs.set(binding, ns)
    }
  })
}

const collectUsages = (
  path: NodePath<t.CallExpression>,
  bindingNs: Map<object, string>,
  file: string,
  out: UsageRecord[],
) => {
  const { callee, arguments: args } = path.node
  if (!t.isIdentifier(callee)) {
    return
  }

  const binding = path.scope.getBinding(callee.name)
  if (!binding || !bindingNs.has(binding)) {
    return
  }

  const keyArg = args[0]
  if (!t.isStringLiteral(keyArg)) {
    return
  }

  out.push({
    namespace: bindingNs.get(binding)!,
    key: keyArg.value,
    file,
    line: path.node.loc?.start.line || 0,
  })
}

const scanFile = (code: string, file: string, out: UsageRecord[]) => {
  const ast = parse(code, {
    filename: file,
    sourceType: 'module',
    plugins: [
      [
        '@babel/plugin-syntax-typescript',
        {
          isTSX: true,
        },
      ],
    ],
  })
  if (!ast) {
    return
  }

  const bindingNs = new Map<object, string>()

  traverse(ast, {
    VariableDeclarator: path => {
      collectBindings(path, bindingNs)
    },
    CallExpression: path => {
      collectUsages(path, bindingNs, file, out)
    },
  })
}

// ============================================================
// Validate: compare usages against labels
// ============================================================

const buildResult = (
  usages: UsageRecord[],
  labels: Labels,
): ValidationResult => {
  labels = labelsSchema.parse(labels)

  // missing: used in code but key not in labels
  const missing: MissingKey[] = usages
    .filter(({ namespace, key }) => !labels[namespace]?.[key])
    .map(({ namespace, key, file, line }) => ({
      namespace,
      key,
      file,
      line,
    }))

  // unused: in labels but never used in any scanned file
  const usedSet = new Map<string, Set<string>>()
  for (const { namespace, key } of usages) {
    if (!usedSet.has(namespace)) {
      usedSet.set(namespace, new Set())
    }
    usedSet.get(namespace)!.add(key)
  }
  const unused: UnusedKey[] = []
  for (const [ns, keys] of Object.entries(labels)) {
    for (const key of Object.keys(keys)) {
      if (!usedSet.get(ns)?.has(key)) {
        unused.push({
          namespace: ns,
          key,
        })
      }
    }
  }

  return {
    missing,
    unused,
  }
}

// ============================================================
// Standalone: scan a list of files and return result
// ============================================================

export const i18nLabelsValidation = ({
  files,
  labels,
}: ScanOptions): ValidationResult => {
  const usages: UsageRecord[] = []

  for (const file of files) {
    if (!shouldTranspile(file)) {
      continue
    }
    const code = fs.readFileSync(file, 'utf-8')
    scanFile(code, file, usages)
  }

  return buildResult(usages, labels)
}

// ============================================================
// Babel plugin: reports missing keys at build time (per file)
// ============================================================

export const i18nLabelsValidationPlugin = (
  _api: ConfigAPI,
  options: PluginOptions,
): PluginObj => {
  const labels = labelsSchema.parse(options.labels)

  return {
    visitor: {
      Program: (programPath, pluginPass) => {
        if (!shouldTranspile(pluginPass.filename)) {
          return
        }

        const bindingNs = new Map<object, string>()
        const usages: UsageRecord[] = []

        programPath.traverse({
          VariableDeclarator: path => {
            collectBindings(path, bindingNs)
          },
          CallExpression: path => {
            collectUsages(path, bindingNs, pluginPass.filename || '', usages)
          },
        })

        for (const { namespace, key } of usages) {
          if (!labels[namespace]?.[key]) {
            throw programPath.buildCodeFrameError(
              `Missing translation key "${key}" in namespace "${namespace}"`,
            )
          }
        }
      },
    },
  }
}
