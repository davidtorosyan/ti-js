// unary
// =====

import * as core from '../../common/core'
import * as types from '../../common/types'

export function evaluate (
  operator: string,
  value: types.ValueResolved,
): types.ValueResolved {
  switch (value.type) {
    case types.NUMBER:
      return visitNumber(operator, value)
    case types.STRING:
      return visitString(operator, value)
    case types.LIST:
      return visitList(operator, value)
    default:
      return core.exhaustiveMatchingGuard(value)
  }
}

function visitNumber (operator: string, argument: types.NumberResolved) {
  return core.newFloat(applyUnaryOperation(operator, argument.float))
}

function visitString (_operator: string, _argument: types.TiString): never {
  throw core.DataTypeError
}

function visitList (operator: string, argument: types.ListResolved): types.ListResolved {
  return {
    type: types.LIST,
    elements: argument.elements.map(e => (
      core.newFloat(applyUnaryOperation(operator, e.float)))),
    resolved: true,
  }
}

function applyUnaryOperation (operator: string, x: number) {
  switch (operator) {
    case '&-': return x * -1
    default: throw core.libError('unexpected unary operator')
  }
}
