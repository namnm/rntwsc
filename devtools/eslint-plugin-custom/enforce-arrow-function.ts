import type { TSESLint, TSESTree } from '@typescript-eslint/utils'

export const enforceArrowFunction: TSESLint.RuleModule<'useArrow', []> = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    docs: {
      description:
        'Enforce arrow functions over function declarations and expressions',
    },
    messages: {
      useArrow: 'Use an arrow function instead',
    },
    schema: [],
  },

  create: c => {
    const src = c.sourceCode

    return {
      // function foo() {} -> const foo = () => {}
      FunctionDeclaration: n => {
        if (!n.body || n.generator || hasThisParam(n.params)) {
          return
        }
        if (n.parent.type === 'ExportDefaultDeclaration') {
          c.report({
            node: n,
            messageId: 'useArrow',
          })
          return
        }
        c.report({
          node: n,
          messageId: 'useArrow',
          fix: f => {
            const name = n.id ? n.id.name : '_'
            return f.replaceText(n, `const ${name} = ${buildArrow(src, n)}`)
          },
        })
      },

      // class A { foo() {} } -> class A { foo = () => {} }
      MethodDefinition: n => {
        if (n.kind !== 'method') {
          return
        }
        const fn = n.value
        if (!fn.body || fn.generator || hasThisParam(fn.params)) {
          return
        }
        c.report({
          node: n,
          messageId: 'useArrow',
          fix: f => {
            const modifiers: string[] = []
            if (n.accessibility) {
              modifiers.push(n.accessibility)
            }
            if (n.static) {
              modifiers.push('static')
            }
            if (n.override) {
              modifiers.push('override')
            }
            const key = n.computed
              ? `[${src.getText(n.key)}]`
              : src.getText(n.key)
            const prefix = modifiers.length ? modifiers.join(' ') + ' ' : ''
            return f.replaceText(n, `${prefix}${key} = ${buildArrow(src, fn)}`)
          },
        })
      },

      // const x = function() {} -> const x = () => {}
      // { foo() {} } -> { foo: () => {} }
      FunctionExpression: n => {
        if (n.generator || hasThisParam(n.params)) {
          return
        }
        const parent = n.parent

        // class methods are handled by MethodDefinition visitor above
        if (parent.type === 'MethodDefinition') {
          return
        }

        // object method shorthand: { foo() {} } -> { foo: () => {} }
        if (
          parent.type === 'Property' &&
          (parent as TSESTree.Property).method
        ) {
          const prop = parent as TSESTree.Property
          c.report({
            node: prop,
            messageId: 'useArrow',
            fix: f => {
              const key = prop.computed
                ? `[${src.getText(prop.key)}]`
                : src.getText(prop.key)
              return f.replaceText(prop, `${key}: ${buildArrow(src, n)}`)
            },
          })
          return
        }

        c.report({
          node: n,
          messageId: 'useArrow',
          fix: f => f.replaceText(n, buildArrow(src, n)),
        })
      },
    }
  },
}

const hasThisParam = (params: TSESTree.Parameter[]): boolean =>
  params.length > 0 &&
  params[0].type === 'Identifier' &&
  (params[0] as TSESTree.Identifier).name === 'this'

const buildArrow = (
  src: TSESLint.SourceCode,
  fn: TSESTree.FunctionExpression | TSESTree.FunctionDeclaration,
): string => {
  const asyncKw = fn.async ? 'async ' : ''
  const tp = fn.typeParameters ? src.getText(fn.typeParameters) : ''
  const params = fn.params.map(p => src.getText(p)).join(', ')
  const ret = fn.returnType ? src.getText(fn.returnType) : ''
  const body = src.getText(fn.body!)
  return `${asyncKw}${tp}(${params})${ret} => ${body}`
}
