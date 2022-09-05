// binary
// ======

import * as core from '../../common/core'
import * as types from '../../common/types'

export function evaluate (
  operator: string,
  left: types.ValueResolved,
  right: types.ValueResolved,
): types.ValueResolved {
  switch (left.type) {
    case types.NUMBER:
      return visitNumber(operator, left, right)
    case types.STRING:
      return visitString(operator, left, right)
    case types.LIST:
      return visitList(operator, left, right)
    default:
      return core.exhaustiveMatchingGuard(left)
  }
}

function visitNumber (
  operator: string,
  left: types.NumberResolved,
  right: types.ValueResolved,
) : types.NumberResolved | types.ListResolved {
  if (right.type !== types.NUMBER) {
    if (right.type === types.LIST) {
      return applyBinaryOperationListAndNumber(operator, right, left)
    }
    throw core.DataTypeError
  }
  return core.newFloat(applyBinaryOperation(operator, left.float, right.float))
}

function visitString (
  operator: string,
  left: types.TiString,
  right: types.ValueResolved,
) : types.TiString | types.NumberResolved {
  if (right.type !== types.STRING) {
    throw core.DataTypeError
  }
  switch (operator) {
    case '+': return { type: types.STRING, chars: left.chars + right.chars }
    case '=': return core.newFloat(left.chars === right.chars ? 1 : 0)
    case '!=': return core.newFloat(left.chars !== right.chars ? 1 : 0)
    default: throw core.DataTypeError
  }
}

function visitList (
  operator: string,
  left: types.ListResolved,
  right: types.ValueResolved,
) : types.ListResolved {
  if (right.type !== types.LIST) {
    if (right.type === types.NUMBER) {
      return applyBinaryOperationListAndNumber(operator, left, right)
    }
    throw core.DataTypeError
  }
  if (left.elements.length !== right.elements.length) {
    throw core.DimMismatchError
  }
  return {
    type: types.LIST,
    elements: left.elements.map((e, i) => {
      const num = right.elements[i]
      if (num === undefined) {
        throw core.libError('Incorrect number of elements in list!')
      }
      return core.newFloat(applyBinaryOperation(operator, e.float, num.float))
    }),
    resolved: true,
  }
}

function applyBinaryOperationListAndNumber (
  operator: string,
  list: types.ListResolved,
  number: types.NumberResolved,
): types.ListResolved {
  return {
    type: types.LIST,
    elements: list.elements.map((e, _i) => (
      core.newFloat(applyBinaryOperation(operator, e.float, number.float)))),
    resolved: true,
  }
}

function applyBinaryOperation (operator: string, x: number, y: number) {
  if (operator === '/' && y === 0) {
    throw core.DivideByZeroError
  }
  switch (operator) {
    case '+': return x + y
    case '-': return x - y
    case '*': return x * y
    case '/': return x / y
    case '=': return x === y ? 1 : 0
    case '!=': return x !== y ? 1 : 0
    case '>=': return x >= y ? 1 : 0
    case '>': return x > y ? 1 : 0
    case '<=': return x <= y ? 1 : 0
    case '<': return x < y ? 1 : 0
    case ' and ': return x && y ? 1 : 0
    case ' or ': return x || y ? 1 : 0
    case ' xor ': return (!x && y) || (x && !y) ? 1 : 0
    default: throw core.libError('unexpected binary operator')
  }
}
