// unary
// =====

import * as core from '../../common/core'
import * as types from '../../common/types'

export function evaluate (
  unary: types.UnaryExpression,
  value: types.ValueResolved,
): types.ValueResolved {
  switch (value.type) {
    case types.NUMBER:
      return visitNumber(unary, value)
    case types.STRING:
      return visitString(unary, value)
    case types.LIST:
      return visitList(unary, value)
    default:
      return core.exhaustiveMatchingGuard(value)
  }
}

function visitNumber (unary: types.UnaryExpression, argument: types.NumberResolved) {
  return core.newFloat(applyUnaryOperation(unary.operator, argument.float))
}

function visitString (_unary: types.UnaryExpression, _argument: types.TiString): never {
  throw core.DataTypeError
}

function visitList (unary: types.UnaryExpression, argument: types.ListResolved): types.ListResolved {
  return {
    type: types.LIST,
    elements: argument.elements.map(e => (
      core.newFloat(applyUnaryOperation(unary.operator, e.float)))),
    resolved: true,
  }
}

function applyUnaryOperation (operator: string, x: number) {
  switch (operator) {
    case '&-': return x * -1
    default: throw core.libError('unexpected unary operator')
  }
}
