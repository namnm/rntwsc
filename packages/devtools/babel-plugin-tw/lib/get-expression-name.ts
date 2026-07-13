import { types as t } from '@babel/core'

export const getExpressionName = (expr: t.Expression): string | undefined => {
  if (t.isIdentifier(expr)) {
    return expr.name
  }
  if (t.isSequenceExpression(expr)) {
    const last = expr.expressions[expr.expressions.length - 1]
    return last ? getExpressionName(last) : undefined
  }
  if (
    t.isMemberExpression(expr) &&
    !expr.computed &&
    t.isIdentifier(expr.property)
  ) {
    return expr.property.name
  }
  if (
    t.isMemberExpression(expr) &&
    expr.computed &&
    t.isStringLiteral(expr.property)
  ) {
    return expr.property.value
  }
  return undefined
}
