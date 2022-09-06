// unary
// =====

import * as core from '../common/core'
import * as types from '../common/types'

export function evaluate (
  operator: string,
  value: types.ValueResolved,
): types.ValueResolved {
  switch (value.type) {
    case types.TiNumber:
      return visitNumber(operator, value)
    case types.TiString:
      return visitString(operator, value)
    case types.TiList:
      return visitList(operator, value)
    default:
      return core.exhaustiveMatchingGuard(value)
  }
}

function visitNumber (operator: string, argument: types.NumberResolved): types.NumberResolved {
  return core.newFloat(applyUnaryOperation(operator, argument.float))
}

function visitString (_operator: string, _argument: types.TiString): never {
  throw new core.TiError(core.TiErrorCode.DataType)
}

function visitList (operator: string, argument: types.ListResolved): types.ListResolved {
  return {
    type: types.TiList,
    elements: argument.elements.map(e => (
      core.newFloat(applyUnaryOperation(operator, e.float)))),
    resolved: true,
  }
}

function applyUnaryOperation (operator: string, x: number): number {
  switch (operator) {
    case '&-': return x * -1
    default: throw new core.LibError('unexpected unary operator')
  }
}
