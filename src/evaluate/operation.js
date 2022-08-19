// operation
// =========

import * as core from '../common/core'
import * as types from '../common/types'

export function isTruthy (value) {
  if (value.type === types.NUMBER) {
    return value.float !== 0
  }
  throw core.DataTypeError
}

export function assignVariable (mem, variable, value) {
  if (variable.type === types.STRINGVARIABLE) {
    if (value.type !== types.STRING) {
      throw core.DataTypeError
    }
  } else if (variable.type === types.VARIABLE) {
    if (value.type !== types.NUMBER) {
      return
    }
  } else if (variable.type === types.LISTVARIABLE) {
    if (value.type !== types.LIST) {
      throw core.DataTypeError
    }
  } else if (variable.type === types.LISTINDEX) {
    if (value.type !== types.LIST) {
      throw core.DataTypeError
    }
  } else {
    throw core.libError('unexpected variable type')
  }
  mem.vars[variable.name] = value
}

export function deleteVariable (mem, variable) {
  delete mem.vars[variable.name]
}

export function hasVariable (mem, variable) {
  return variable.name in mem.vars
}

export function assignAns (mem, value) {
  mem.ans = value
}

export function binaryOperation (left, operator, right) {
  return {
    type: types.BINARY,
    operator,
    left,
    right,
  }
}

export function resolveNumber (value) {
  let str = ''
  if (value.integer !== undefined && value.integer !== null) {
    str += value.integer
  }
  if (value.fraction !== undefined && value.fraction !== null) {
    str += '.' + value.fraction
  }
  if (value.exponent !== undefined && value.exponent !== null) {
    str += 'e' + value.exponent
  }
  return parseFloat(str)
}

export function variableToString (variable) {
  let str = variable.name
  switch (variable.type) {
    case types.VARIABLE:
    case types.STRINGVARIABLE:
      break
    case types.LISTVARIABLE:
      str = str.substring(4)
      if (!variable.custom) {
        str = `&L${str}`
      }
      break
    default:
      throw core.libError('unexpected variable tostring')
  }
  return str
}

export function valueToString (value, strict = false) {
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

export function parseDigit (str) {
  if (str === undefined || str === null || str === '' || str.length > 1) {
    return
  }
  const digit = str.charCodeAt(0) - '0'.charCodeAt(0)
  if (digit < 0 || digit > 9) {
    return
  }
  return digit
}
