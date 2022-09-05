// binary
// ======

import * as core from '../../common/core'
import * as types from '../../common/types'

export function evaluate (
  binary: types.BinaryExpression,
  left: types.ValueResolved,
  right: types.ValueResolved,
): types.ValueResolved {
  switch (left.type) {
    case types.NUMBER:
      return visitNumber(binary, left, right)
    case types.STRING:
      return visitString(binary, left, right)
    case types.LIST:
      return visitList(binary, left, right)
    default:
      return core.exhaustiveMatchingGuard(left)
  }
}

function visitNumber (
  binary: types.BinaryExpression,
  left: types.NumberResolved,
  right: types.ValueResolved,
) : types.NumberResolved | types.ListResolved {
  if (right.type !== types.NUMBER) {
    if (right.type === types.LIST) {
      return applyBinaryOperationListAndNumber(binary.operator, right, left)
    }
    throw core.DataTypeError
  }
  return core.newFloat(applyBinaryOperation(binary.operator, left.float, right.float))
}

function visitString (
  binary: types.BinaryExpression,
  left: types.TiString,
  right: types.ValueResolved,
) : types.TiString | types.NumberResolved {
  if (right.type !== types.STRING) {
    throw core.DataTypeError
  }
  switch (binary.operator) {
    case '+': return { type: types.STRING, chars: left.chars + right.chars }
    case '=': return core.newFloat(left.chars === right.chars ? 1 : 0)
    case '!=': return core.newFloat(left.chars !== right.chars ? 1 : 0)
    default: throw core.DataTypeError
  }
}

function visitList (
  binary: types.BinaryExpression,
  left: types.ListResolved,
  right: types.ValueResolved,
) : types.ListResolved {
  if (right.type !== types.LIST) {
    if (right.type === types.NUMBER) {
      return applyBinaryOperationListAndNumber(binary.operator, left, right)
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
      return core.newFloat(applyBinaryOperation(binary.operator, e.float, num.float))
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
