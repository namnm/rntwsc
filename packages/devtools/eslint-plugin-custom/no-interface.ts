import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const noInterface: TSESLint.RuleModule<'noInterface', []> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description: 'Use type alias instead of interface',
    },
    messages: {
      noInterface: 'Use type alias instead of interface',
    },
    schema: [],
  },

  create: c => ({
    TSInterfaceDeclaration: (n: TSESTree.TSInterfaceDeclaration) => {
      c.report({
        node: n,
        messageId: 'noInterface',
        fix: f => {
          const src = c.sourceCode
          const name = src.getText(n.id)
          const typeParams = n.typeParameters
            ? src.getText(n.typeParameters)
            : ''
          const body = src.getText(n.body)
          const declare = n.declare ? 'declare ' : ''
          let result = `${declare}type ${name}${typeParams} = `
          if (n.extends && n.extends.length > 0) {
            result += n.extends.map(e => src.getText(e)).join(' & ') + ' & '
          }
          result += body
          return f.replaceText(n, result)
        },
      })
    },
  }),
}
