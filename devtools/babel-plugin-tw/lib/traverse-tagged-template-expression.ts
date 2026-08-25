import type { NodePath, types as t } from '@babel/core'

import { twFn } from 'rntwsc/devtools/babel-plugin-tw/lib/config'
import { context } from 'rntwsc/devtools/babel-plugin-tw/lib/context'
import { getExpressionName } from 'rntwsc/devtools/babel-plugin-tw/lib/get-expression-name'
import { jsToNode } from 'rntwsc/devtools/babel-plugin-tw/lib/js-to-node'
import type { TraverseOptions } from 'rntwsc/devtools/babel-plugin-tw/visitor'

export const traverseTaggedTemplateExpression = (
  path: NodePath<t.TaggedTemplateExpression>,
  options: TraverseOptions,
) => {
  const tag = path.node.tag
  const tagName = getExpressionName(tag)
  if (!tagName || !twFn.tw(tagName)) {
    return
  }

  const ctx = context({
    ...options,
    rootPath: path,
  })
  let transpiled: any = ctx.transpileClassName({
    path,
    value: path.node.quasi.quasis.map(q => q.value.raw).join(' '),
  })

  if (ctx.extract) {
    return
  }

  transpiled = jsToNode(ctx, transpiled)
  path.replaceWith(transpiled)
}
