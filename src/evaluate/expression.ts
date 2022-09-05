// expression
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import * as operation from './operation'
import * as unary from './expressions/unary'
import * as binary from './expressions/binary'

export function evaluate (value: types.ValueExpression, mem: core.Memory): types.ValueResolved {
  switch (value.type) {
    case types.SyntaxError:
      return visitSyntaxError(value, mem)
    case types.NUMBER:
      return visitNumber(value, mem)
    case types.STRING:
      return visitString(value, mem)
    case types.LIST:
      return visitList(value, mem)
    case types.VARIABLE:
      return visitVariable(value, mem)
    case types.STRINGVARIABLE:
      return visitStringVariable(value, mem)
    case types.LISTVARIABLE:
      return visitListVariable(value, mem)
    case types.LISTINDEX:
      return visitListIndex(value, mem)
    case types.ANS:
      return visitAns(value, mem)
    case types.GetKey:
      return visitGetKey(value, mem)
    case types.UNARY:
      return visitUnaryExpression(value, mem)
    case types.BINARY:
      return visitBinaryExpression(value, mem)
    default:
      return core.exhaustiveMatchingGuard(value)
  }
}

// ----- Expressions -----

function visitSyntaxError (_value: types.ValueExpression, _mem: core.Memory): never {
  throw core.SyntaxError
}

// ----- Values -----

function visitNumber (value: types.TiNumber, _mem: core.Memory) {
  if (value.resolved) {
    return value
  }
  return core.newFloat(operation.resolveNumber(value))
}

function visitString (value: types.TiString, _mem: core.Memory) {
  return value
}

function visitList (value: types.TiList, mem: core.Memory) : types.ListResolved {
  if (value.resolved === true) {
    return value
  }
  return {
    type: types.LIST,
    elements: value.elements.map(function (element) {
      const result = evaluate(element, mem)
      if (result.type !== types.NUMBER) {
        // TODO: a list of lists should be a syntax error
        // However, a list of list variables should still be a data type error
        // Distinguishing them here is hard - should be done in grammar?
        throw core.DataTypeError
      }
      return result
    }),
    resolved: true,
  }
}

// ----- Variables -----

function visitVariable (value: types.Variable, mem: core.Memory) {
  let result = mem.vars.get(value.name)
  if (result === undefined) {
    result = core.newFloat()
    mem.vars.set(value.name, result)
  }
  return result
}

function visitStringVariable (value: types.StringVariable, mem: core.Memory) {
  const result = mem.vars.get(value.name)
  if (result === undefined) {
    throw core.UndefinedError
  }
  return result
}

function visitListVariable (value: types.ListVariable, mem: core.Memory) {
  const result = mem.vars.get(value.name)
  if (result === undefined) {
    throw core.UndefinedError
  }
  return result
}

function visitListIndex (value: types.ListIndex, mem: core.Memory) {
  if (value.type !== types.LISTINDEX) {
    throw core.libError('unexpected expression type, list index')
  }
  const list = evaluate(value.list, mem)
  const index = evaluate(value.index, mem)
  if (list.type !== types.LIST) {
    throw core.libError('unexpected expression type, should be list')
  }
  if (index.type !== types.NUMBER) {
    throw core.InvalidDimError
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw core.InvalidDimError
  }
  const elem = list.elements[index.float - 1]
  if (elem === undefined) {
    throw core.libError('unexpected incorrect list length')
  }
  return core.newFloat(elem.float)
}

// ----- Tokens -----

function visitAns (_value: types.Ans, mem: core.Memory) {
  return mem.ans
}

function visitGetKey (_value: types.GetKey, _mem: core.Memory) : never {
  throw core.UnimplementedError
}

// ----- Operators -----

function visitUnaryExpression (value: types.UnaryExpression, mem: core.Memory) {
  const argument = evaluate(value.argument, mem)
  return unary.evaluate(value.operator, argument)
}

function visitBinaryExpression (value: types.BinaryExpression, mem: core.Memory) {
  const left = evaluate(value.left, mem)
  const right = evaluate(value.right, mem)
  return binary.evaluate(value.operator, left, right)
}
