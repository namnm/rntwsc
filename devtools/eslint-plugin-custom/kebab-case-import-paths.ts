import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const kebabRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/

export const kebabCaseImportPaths: TSESLint.RuleModule<
  'kebabCaseImportPaths',
  [{ skip?: string }?]
> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Enforce kebab-case for import path directories and file names',
    },
    messages: {
      kebabCaseImportPaths:
        "Import path segment '{{segment}}' should be in kebab-case",
    },
    schema: [
      {
        type: 'object',
        properties: {
          skip: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: c => {
    const skipRegex = c.options[0]?.skip ? new RegExp(c.options[0].skip) : null

    const check = (src: TSESTree.StringLiteral | null) => {
      if (!src) {
        return
      }
      if (skipRegex && skipRegex.test(src.value)) {
        return
      }
      const segments = getSegmentsToCheck(src.value)
      for (let i = 0; i < segments.length; i++) {
        const raw = segments[i]
        const name = i === segments.length - 1 ? getBaseName(raw) : raw
        if (name && !kebabRegex.test(name)) {
          c.report({
            node: src,
            messageId: 'kebabCaseImportPaths',
            data: {
              segment: name,
            },
          })
          return
        }
      }
    }

    return {
      ImportDeclaration: n => check(n.source),
      ExportNamedDeclaration: n => check(n.source),
      ExportAllDeclaration: n => check(n.source),
    }
  },
}

const getBaseName = (segment: string): string => {
  const i = segment.indexOf('.')
  return i === -1 ? segment : segment.slice(0, i)
}

const getSegmentsToCheck = (importPath: string): string[] => {
  let raw: string
  if (importPath.startsWith('./') || importPath.startsWith('../')) {
    raw = importPath
    return raw.split('/').filter(s => s !== '' && s !== '.' && s !== '..')
  }
  if (importPath.startsWith('#/')) {
    raw = importPath.slice('#/'.length)
    return raw.split('/').filter(Boolean)
  }
  if (importPath.startsWith('#')) {
    raw = importPath.slice(1)
    return raw.split('/').filter(Boolean)
  }
  return []
}
