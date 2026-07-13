import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { fs } from '@/devtools/fs'
import { stripInDir } from '@/devtools/path'

const variants = ['native', 'ios', 'android', 'browser'] as const

type Options = {
  repoRoot: string
}

export const noImportInvalidVariant: TSESLint.RuleModule<
  'noImportInvalidVariant' | 'missingBaseFile' | 'missingNativeFile',
  [Options]
> = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Import with a variant suffix requires current file to have the same variant suffix',
    },
    messages: {
      noImportInvalidVariant:
        "Import '{{importPath}}' has variant '.{{variant}}' but this file does not",
      missingBaseFile:
        "File '{{file}}' requires a base file '{{base}}' to exist",
      missingNativeFile:
        "File '{{file}}' requires a native variant '{{native}}' to exist",
    },
    schema: [
      {
        type: 'object',
        properties: {
          repoRoot: {
            type: 'string',
            required: true,
          },
        },
        additionalProperties: false,
        required: true,
      },
    ],
  },

  create: c => {
    const fileVariant = getVariant(c.filename)
    const { repoRoot } = c.options[0]

    const check = (src: TSESTree.StringLiteral | null) => {
      if (!src) {
        return
      }
      const importPath = src.value
      const importVariant = getVariant(importPath)
      if (!importVariant || fileVariant === importVariant) {
        return
      }
      c.report({
        node: src,
        messageId: 'noImportInvalidVariant',
        data: {
          importPath,
          variant: importVariant,
        },
      })
    }

    return {
      Program: n => {
        if (fileVariant === 'native' || fileVariant === 'browser') {
          const base = getSiblingPath(c.filename, fileVariant, '')
          if (base && !fs.existsSync(base)) {
            c.report({
              node: n,
              messageId: 'missingBaseFile',
              data: {
                file: stripInDir(repoRoot, c.filename),
                base: stripInDir(repoRoot, base),
              },
            })
          }
        }
        if (fileVariant === 'browser') {
          const native = getSiblingPath(c.filename, fileVariant, '.native')
          if (native && !fs.existsSync(native)) {
            c.report({
              node: n,
              messageId: 'missingNativeFile',
              data: {
                file: stripInDir(repoRoot, c.filename),
                native: stripInDir(repoRoot, native),
              },
            })
          }
        }
      },
      ImportDeclaration: n => n.importKind !== 'type' && check(n.source),
      ExportNamedDeclaration: n =>
        n.exportKind !== 'type' &&
        n.specifiers.some(s => s.exportKind !== 'type') &&
        check(n.source),
      ExportAllDeclaration: n => n.exportKind !== 'type' && check(n.source),
    }
  },
}

const getVariant = (path: string) => {
  const withoutExt = path.replace(/\.[jt]sx?$/, '')
  for (const v of variants) {
    if (withoutExt.endsWith(`.${v}`)) {
      return v
    }
  }
  return
}

const getSiblingPath = (
  filename: string,
  variant: string,
  replacement: string,
) => {
  const ext = filename.match(/\.[jt]sx?$/)?.[0]
  if (!ext) {
    return null
  }
  const withoutExt = filename.slice(0, -ext.length)
  const withoutVariant = withoutExt.slice(0, -(variant.length + 1))
  return withoutVariant + replacement + ext
}
