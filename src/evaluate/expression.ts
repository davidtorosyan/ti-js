// expression
// ==========

import * as core from '../common/core'
import * as types from 'common/types'
import * as operation from './helper/operation'
import * as unary from './unary'
import * as binary from './binary'
import type * as device from '../device/device'

export function evaluate (value: types.ValueExpression, mem: device.Memory): types.ValueResolved {
  switch (value.type) {
    case types.TiSyntaxError:
      return visitSyntaxError(value, mem)
    case types.TiNumber:
      return visitNumber(value, mem)
    case types.TiString:
      return visitString(value, mem)
    case types.TiList:
      return visitList(value, mem)
    case types.NumberVariable:
      return visitVariable(value, mem)
    case types.StringVariable:
      return visitStringVariable(value, mem)
    case types.ListVariable:
      return visitListVariable(value, mem)
    case types.ListIndex:
      return visitListIndex(value, mem)
    case types.ANS:
      return visitAns(value, mem)
    case types.GetKey:
      return visitGetKey(value, mem)
    case types.UnaryExpression:
      return visitUnaryExpression(value, mem)
    case types.BinaryExpression:
      return visitBinaryExpression(value, mem)
    default:
      return core.exhaustiveMatchingGuard(value)
  }
}

// ----- Expressions -----

function visitSyntaxError (_value: types.ValueExpression, _mem: device.Memory): never {
  throw new core.TiError(core.TiErrorCode.Syntax)
}

// ----- Values -----

function visitNumber (value: types.TiNumber, _mem: device.Memory): types.NumberResolved {
  if (value.resolved) {
    return value
  }
  return core.newFloat(operation.resolveNumber(value))
}

function visitString (value: types.TiString, _mem: device.Memory): types.TiString {
  return value
}

function visitList (value: types.TiList, mem: device.Memory): types.ListResolved {
  if (value.resolved) {
    return value
  }
  return {
    type: types.TiList,
    elements: value.elements.map(function (element) {
      const result = evaluate(element, mem)
      if (result.type !== types.TiNumber) {
        // TODO: a list of lists should be a syntax error
        // However, a list of list variables should still be a data type error
        // Distinguishing them here is hard - should be done in grammar?
        throw new core.TiError(core.TiErrorCode.DataType)
      }
      return result
    }),
    resolved: true,
  }
}

// ----- Variables -----

function visitVariable (value: types.Variable, mem: device.Memory): types.ValueResolved {
  let result = mem.get(value.name)
  if (result === undefined) {
    result = core.newFloat()
    mem.set(value.name, result)
  }
  return result
}

function visitStringVariable (value: types.StringVariable, mem: device.Memory): types.ValueResolved {
  const result = mem.get(value.name)
  if (result === undefined) {
    throw new core.TiError(core.TiErrorCode.Undefined)
  }
  return result
}

function visitListVariable (value: types.ListVariable, mem: device.Memory): types.ValueResolved {
  const result = mem.get(value.name)
  if (result === undefined) {
    throw new core.TiError(core.TiErrorCode.Undefined)
  }
  return result
}

function visitListIndex (value: types.ListIndex, mem: device.Memory): types.NumberResolved {
  const list = evaluate(value.list, mem)
  const index = evaluate(value.index, mem)
  if (list.type !== types.TiList) {
    throw new core.LibError('unexpected expression type, should be list')
  }
  if (index.type !== types.TiNumber) {
    throw new core.TiError(core.TiErrorCode.InvalidDim)
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw new core.TiError(core.TiErrorCode.InvalidDim)
  }
  const elem = list.elements[index.float - 1]
  if (elem === undefined) {
    throw new core.LibError('unexpected incorrect list length')
  }
  return core.newFloat(elem.float)
}

// ----- Tokens -----

function visitAns (_value: types.Ans, mem: device.Memory): types.ValueResolved {
  return mem.getAns()
}

function visitGetKey (_value: types.GetKey, _mem: device.Memory): never {
  throw new core.LibError(core.UNIMPLEMENTED_MESSAGE)
}

// ----- Operators -----

function visitUnaryExpression (value: types.UnaryExpression, mem: device.Memory): types.ValueResolved {
  const argument = evaluate(value.argument, mem)
  return unary.evaluate(value.operator, argument)
}

function visitBinaryExpression (value: types.BinaryExpression, mem: device.Memory): types.ValueResolved {
  const left = evaluate(value.left, mem)
  const right = evaluate(value.right, mem)
  return binary.evaluate(value.operator, left, right)
}
