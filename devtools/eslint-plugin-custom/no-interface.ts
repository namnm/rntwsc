import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

const isInDeclareScope = (node: TSESTree.Node): boolean => {
  let cur: TSESTree.Node | undefined = node.parent
  while (cur) {
    if (
      cur.type === 'TSModuleDeclaration' &&
      (cur as TSESTree.TSModuleDeclaration).declare
    ) {
      return true
    }
    cur = cur.parent
  }
  return false
}

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
      if (n.declare || isInDeclareScope(n)) {
        return
      }
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
          let result = `type ${name}${typeParams} = `
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
