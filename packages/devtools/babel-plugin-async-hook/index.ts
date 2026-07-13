import type { NodePath, PluginObj } from '@babel/core'
import { types as t } from '@babel/core'

import { shouldTranspile } from '@/devtools/babel-config/should-transpile'
import { getExpressionName } from '@/devtools/babel-plugin-tw/lib/get-expression-name'
import { get } from '@/libs/lodash'

const hookRegex = /^use[A-Z]/

export const asyncHookPlugin: PluginObj = {
  visitor: {
    // use program path to get plugin pass and perform some checks before traverse
    // also prioritize this plugin over others such as react compiler
    Program: (programPath, pluginPass) => {
      if (!shouldTranspile(pluginPass.filename)) {
        return
      }
      const isServer = get(pluginPass.opts, 'isServer')
      if (isServer) {
        return
      }
      programPath.traverse({
        CallExpression: traverseCallExpression,
      })
    },
  },
}

const traverseCallExpression = (p: NodePath<t.CallExpression>) => {
  const callee = p.node.callee
  if (!t.isExpression(callee)) {
    return
  }
  const calleeName = getExpressionName(callee)
  if (!calleeName || !hookRegex.test(calleeName)) {
    return
  }

  const parentFn = p.getFunctionParent()
  if (
    !parentFn ||
    !parentFn.node.async ||
    !(
      parentFn.isFunctionDeclaration() ||
      parentFn.isFunctionExpression() ||
      parentFn.isArrowFunctionExpression() ||
      parentFn.isObjectMethod() ||
      parentFn.isClassMethod()
    )
  ) {
    return
  }

  parentFn.traverse({
    Function: inner => {
      if (inner === parentFn) {
        return
      }
      inner.skip()
    },
    AwaitExpression: stripAwaitOrYield,
    YieldExpression: stripAwaitOrYield,
  })

  parentFn.node.async = false
}

const stripAwaitOrYield = (
  p: NodePath<t.YieldExpression | t.AwaitExpression>,
) => {
  const arg = p.node.argument
  const invalid = (): never => {
    throw p.buildCodeFrameError(
      'Only support `await use...` or `await Promise.all(...)`',
    )
  }
  if (!arg) {
    return invalid()
  }
  if (t.isCallExpression(arg) && t.isExpression(arg.callee)) {
    const name = getExpressionName(arg.callee)
    if (name && hookRegex.test(name)) {
      p.replaceWith(arg)
      return
    }
  }
  if (t.isCallExpression(arg) && t.isMemberExpression(arg.callee)) {
    const { object, property, computed } = arg.callee
    const isPromiseAll =
      t.isIdentifier(object, {
        name: 'Promise',
      }) &&
      t.isIdentifier(property, {
        name: 'all',
      }) &&
      !computed
    if (!isPromiseAll) {
      return invalid()
    }
    p.replaceWith(arg.arguments[0])
    return
  }
  return invalid()
}
