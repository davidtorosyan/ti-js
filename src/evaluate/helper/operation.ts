// operation
// =========

import * as core from '../../common/core'
import * as types from '../../common/types'

export function isTruthy (value: types.ValueResolved): boolean {
  if (value.type === types.TiNumber) {
    return value.float !== 0
  }
  throw new core.TiError(core.TiErrorCode.DataType)
}

export function deleteVariable (mem: core.Memory, variable: types.Variable): void {
  mem.vars.delete(variable.name)
}

export function hasVariable (mem: core.Memory, variable: types.Variable): boolean {
  return mem.vars.has(variable.name)
}

export function assignAns (mem: core.Memory, value: types.ValueResolved): void {
  mem.ans = value
}

export function binaryOperation (
  left: types.ValueExpression,
  operator: string,
  right: types.ValueExpression,
): types.BinaryExpression {
  return {
    type: types.BinaryExpression,
    operator,
    left,
    right,
  }
}

export function resolveNumber (value: types.NumberLiteral): number {
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
    throw new core.LibError('Unable to resolve number, no data')
  }
  return parseFloat(str)
}

export function variableToString (variable: types.Variable): string {
  let str = variable.name
  switch (variable.type) {
    case types.NumberVariable:
    case types.StringVariable:
      break
    case types.ListVariable:
      str = str.substring(types.ListVariablePrefix.length)
      if (!variable.custom) {
        str = `&L${str}`
      }
      break
    default:
      throw new core.LibError('unexpected variable tostring')
  }
  return str
}

export function valueToString (value: types.ValueResolved, strict = false): string {
  if (strict && value.type !== types.TiString) {
    throw new core.TiError(core.TiErrorCode.DataType)
  }
  let str = ''
  switch (value.type) {
    case types.TiNumber:
      str = value.float.toString()
      if (str.startsWith('0.')) {
        str = str.substring(1)
      }
      break
    case types.TiString:
      str = value.chars
      break
    case types.TiList:
      str = '{' + value.elements.map(e => valueToString(e)).join(' ') + '}'
      break
    default:
      throw new core.LibError('unexpected value tostring')
  }
  return str
}

export function parseDigit (str?: string | null): number | undefined {
  if (str === undefined || str === null || str === '' || str.length > 1) {
    return undefined
  }
  const digit = str.charCodeAt(0) - '0'.charCodeAt(0)
  if (digit < 0 || digit > 9) {
    return undefined
  }
  return digit
}
