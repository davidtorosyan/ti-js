// operation
// =========

import * as core from '../common/core'
import * as types from '../common/types'

export function isTruthy(value: types.ValueResolved) {
  if (value.type === types.NUMBER) {
    return value.float !== 0
  }
  throw core.DataTypeError
}

export function deleteVariable(mem: core.Memory, variable: types.Variable) {
  mem.vars.delete(variable.name)
}

export function hasVariable(mem: core.Memory, variable: types.Variable) {
  return mem.vars.has(variable.name)
}

export function assignAns(mem: core.Memory, value: types.ValueResolved) {
  mem.ans = value
}

export function binaryOperation(
  left: types.ValueExpression,
  operator: string,
  right: types.ValueExpression,
): types.BinaryExpression {
  return {
    type: types.BINARY,
    operator,
    left,
    right,
  }
}

export function resolveNumber(value: types.NumberLiteral) {
  let str = ''
  if (value.integer !== undefined) {
    str += value.integer
  }
  if (value.fraction !== undefined && value.fraction !== null) {
    str += '.' + value.fraction
  }
  if (value.exponent !== undefined && value.exponent !== null) {
    str += 'e' + value.exponent
  }
  if (str.length === 0) {
    throw core.libError('Unable to resolve number, no data')
  }
  return parseFloat(str)
}

export function variableToString(variable: types.Variable) {
  let str = variable.name
  switch (variable.type) {
    case types.VARIABLE:
    case types.STRINGVARIABLE:
      break
    case types.LISTVARIABLE:
      str = str.substring(types.ListVariablePrefix.length)
      if (!variable.custom) {
        str = `&L${str}`
      }
      break
    default:
      throw core.libError('unexpected variable tostring')
  }
  return str
}

export function valueToString(value: types.ValueResolved, strict = false) {
  if (strict && value.type !== types.STRING) {
    throw core.DataTypeError
  }
  let str = ''
  switch (value.type) {
    case types.NUMBER:
      str = value.float.toString()
      if (str.startsWith('0.')) {
        str = str.substring(1)
      }
      break
    case types.STRING:
      str = value.chars
      break
    case types.LIST:
      str = '{' + value.elements.map(e => valueToString(e)).join(' ') + '}'
      break
    default:
      throw core.libError('unexpected value tostring')
  }
  return str
}

export function parseDigit(str: string) {
  if (str === undefined || str === null || str === '' || str.length > 1) {
    return
  }
  const digit = str.charCodeAt(0) - '0'.charCodeAt(0)
  if (digit < 0 || digit > 9) {
    return
  }
  return digit
}
