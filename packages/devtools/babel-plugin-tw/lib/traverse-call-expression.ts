import type { NodePath } from '@babel/core'
import { types as t } from '@babel/core'

import { twFn } from '#/devtools/babel-plugin-tw/lib/config'
import { context } from '#/devtools/babel-plugin-tw/lib/context'
import { getExpressionName } from '#/devtools/babel-plugin-tw/lib/get-expression-name'
import { transpileClsx } from '#/devtools/babel-plugin-tw/lib/transpile-clsx'
import { transpileCva } from '#/devtools/babel-plugin-tw/lib/transpile-cva'
import type { TraverseOptions } from '#/devtools/babel-plugin-tw/visitor'

export const traverseCallExpression = (
  path: NodePath<t.CallExpression>,
  options: TraverseOptions,
) => {
  const callee = path.node.callee
  if (!t.isExpression(callee)) {
    return
  }

  const calleeName = getExpressionName(callee)
  if (!calleeName) {
    return
  }
  if (!twFn.cva(calleeName) && !twFn.clsx(calleeName)) {
    return
  }

  const ctx = context({
    ...options,
    rootPath: path,
    // callee is about to be discarded when path.replaceWith() below
    // need to clone to preserve the original callee
    calleeNode: t.cloneNode(callee, true),
  })
  const transpiled: any = twFn.cva(calleeName)
    ? transpileCva(ctx, path)
    : transpileClsx(ctx, path)

  if (ctx.extract) {
    return
  }

  path.replaceWith(transpiled)
}
