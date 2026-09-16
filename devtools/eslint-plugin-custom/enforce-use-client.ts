import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

import { shouldTranspileExtension } from 'rntwsc/devtools/babel-config/should-transpile'

type MessageId =
  'enforceUseClient' | 'wrongPosition' | 'missingNewlines' | 'disallowUseClient'

type Options = {
  imports?: string[]
  global?: string[]
}

export const enforceUseClient: TSESLint.RuleModule<MessageId, [Options]> = {
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: "Enforce 'use client' directive when required",
    },
    messages: {
      enforceUseClient: "File should start with 'use client' directive",
      wrongPosition: "'use client' directive should be at the top of the file",
      missingNewlines:
        "'use client' directive should be followed by 2 newlines",
      disallowUseClient: "File should not contain 'use client' directive",
    },
    schema: [
      {
        type: 'object',
        properties: {
          imports: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
          global: {
            type: 'array',
            items: {
              type: 'string',
            },
            uniqueItems: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create: c => {
    if (
      !shouldTranspileExtension.test(c.filename) ||
      /\.(ios|android|native)\.tsx?$/.test(c.filename)
    ) {
      return {
        ExpressionStatement: n => {
          if (
            n.expression.type !== 'Literal' ||
            n.expression.value !== 'use client'
          ) {
            return
          }
          c.report({
            node: n,
            messageId: 'disallowUseClient',
            fix: f => {
              const text = c.sourceCode.getText()
              const [start, end] = n.range
              let removeEnd = end
              while (removeEnd < text.length && text[removeEnd] === '\n') {
                removeEnd++
              }
              return f.removeRange([start, removeEnd])
            },
          })
        },
      }
    }

    let hasUseClient = false
    let useClientNode: TSESTree.ExpressionStatement | null = null
    let shouldEnforce = /\.browser\.tsx?$/.test(c.filename)
    const { imports, global } = c.options[0] || {}
    const importMatches = new Set(imports || [])
    const globalMatches = new Set(global || [])

    return {
      Program: n => {
        // Find directive in leading directive prologue position
        for (const stmt of n.body) {
          if (stmt.type !== 'ExpressionStatement') {
            break
          }
          const expr = stmt.expression
          if (expr.type !== 'Literal' || typeof expr.value !== 'string') {
            break
          }
          if (expr.value === 'use client') {
            hasUseClient = true
            useClientNode = stmt
            break
          }
        }
        // If not found at top, search the whole body
        if (!useClientNode) {
          for (const stmt of n.body) {
            if (
              stmt.type === 'ExpressionStatement' &&
              stmt.expression.type === 'Literal' &&
              stmt.expression.value === 'use client'
            ) {
              useClientNode = stmt
              break
            }
          }
        }
      },

      ImportDeclaration: n => {
        if (shouldEnforce || hasUseClient) {
          return
        }
        for (const s of n.specifiers) {
          if (
            s.type === 'ImportSpecifier' &&
            s.imported.type === 'Identifier' &&
            importMatches.has(s.imported.name)
          ) {
            shouldEnforce = true
          }
        }
      },

      // Identifier referencing a name in the global list -> use client
      Identifier: (n: TSESTree.Identifier) => {
        if (shouldEnforce || hasUseClient || !globalMatches.has(n.name)) {
          return
        }
        const p = n.parent
        // typeof window -> safe guard, not actual usage
        if (p.type === 'UnaryExpression' && p.operator === 'typeof') {
          return
        }
        // Skip when used as a static property name, not a value reference
        if (p.type === 'MemberExpression' && !p.computed && p.property === n) {
          return
        }
        if (p.type === 'Property' && !p.computed && p.key === n) {
          return
        }
        if (p.type === 'MethodDefinition' && !p.computed && p.key === n) {
          return
        }
        if (
          p.type === 'ImportSpecifier' ||
          p.type === 'ImportDefaultSpecifier' ||
          p.type === 'ImportNamespaceSpecifier'
        ) {
          return
        }
        // Skip TypeScript type-only positions
        if (
          (p.type === 'TSPropertySignature' ||
            p.type === 'TSMethodSignature') &&
          p.key === n
        ) {
          return
        }
        if (
          p.type === 'TSTypeReference' ||
          p.type === 'TSTypeQuery' ||
          p.type === 'TSTypeParameter'
        ) {
          return
        }
        // Skip if the name is declared as a local variable anywhere in scope chain
        let scope = c.sourceCode.getScope(n)
        while (scope) {
          if (
            scope.variables.some(v => v.name === n.name && v.defs.length > 0)
          ) {
            return
          }
          if (!scope.upper) {
            break
          }
          scope = scope.upper
        }
        shouldEnforce = true
      },

      'Program:exit': n => {
        if (!shouldEnforce) {
          return
        }

        const text = c.sourceCode.getText()

        if (!hasUseClient) {
          // Directive is missing entirely -> add at top
          if (!useClientNode) {
            c.report({
              node: n,
              messageId: 'enforceUseClient',
              fix: f => f.insertTextBeforeRange([0, 0], "'use client'\n\n"),
            })
            return
          }

          // Directive exists but below non-comment content -> move to top
          const [start, end] = useClientNode.range
          c.report({
            node: useClientNode,
            messageId: 'wrongPosition',
            fix: f => {
              let removeEnd = end
              while (removeEnd < text.length && text[removeEnd] === '\n') {
                removeEnd++
              }
              return [
                f.removeRange([start, removeEnd]),
                f.insertTextBeforeRange([0, 0], "'use client'\n\n"),
              ]
            },
          })
          return
        }

        // type guarantee
        if (!useClientNode) {
          return
        }

        // Directive is at top - check trailing newlines
        const [, directiveEnd] = useClientNode.range
        let pos = directiveEnd
        let newlineCount = 0
        while (pos < text.length && text[pos] === '\n') {
          newlineCount++
          pos++
        }
        if (newlineCount >= 2) {
          return
        }
        c.report({
          node: useClientNode!,
          messageId: 'missingNewlines',
          fix: f =>
            f.replaceTextRange(
              [directiveEnd, directiveEnd],
              '\n'.repeat(2 - newlineCount),
            ),
        })
      },
    }
  },
}
