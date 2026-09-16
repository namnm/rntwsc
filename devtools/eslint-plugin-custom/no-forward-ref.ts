import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const noForwardRef: TSESLint.RuleModule<'noForwardRef', []> = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Do not use `forwardRef` - React forwards `ref` as a plain prop automatically since React 19',
    },
    messages: {
      noForwardRef:
        'Do not use `forwardRef` - accept `ref` as a regular prop instead, React forwards it automatically since React 19',
    },
    schema: [],
  },

  create: c => {
    const check = (
      n: TSESTree.ImportSpecifier | TSESTree.CallExpression,
      name: string,
    ) => {
      if (name !== 'forwardRef') {
        return
      }
      c.report({
        node: n,
        messageId: 'noForwardRef',
      })
    }
    return {
      ImportDeclaration: n => {
        for (const s of n.specifiers) {
          if (
            s.type === 'ImportSpecifier' &&
            s.imported.type === 'Identifier'
          ) {
            check(s, s.imported.name)
          }
        }
      },
      CallExpression: n => {
        if (n.callee.type === 'Identifier') {
          check(n, n.callee.name)
        }
        if (
          n.callee.type === 'MemberExpression' &&
          n.callee.property.type === 'Identifier'
        ) {
          check(n, n.callee.property.name)
        }
      },
    }
  },
}
