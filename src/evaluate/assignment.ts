// assignment
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import * as expression from './expression'

export function evaluate (assignable: types.Assignable, value: types.ValueResolved, mem: core.Memory) {
  switch (assignable.type) {
    case types.VARIABLE:
      return visitVariable(assignable, value, mem)
    case types.STRINGVARIABLE:
      return visitStringVariable(assignable, value, mem)
    case types.LISTVARIABLE:
      return visitListVariable(assignable, value, mem)
    case types.LISTINDEX:
      return visitListIndex(assignable, value, mem)
    default:
      return core.exhaustiveMatchingGuard(assignable)
  }
}

// ----- Statements -----

function visitVariable (variable: types.Variable, value: types.ValueResolved, mem: core.Memory) {
  if (value.type !== types.NUMBER) {
    return
  }
  if (!value.resolved) {
    throw core.libError('unexpected number not resolved')
  }
  mem.vars.set(variable.name, value)
}

function visitStringVariable (variable: types.StringVariable, value: types.ValueResolved, mem: core.Memory) {
  if (value.type !== types.STRING) {
    throw core.DataTypeError
  }
  mem.vars.set(variable.name, value)
}

function visitListVariable (variable: types.ListVariable, value: types.ValueResolved, mem: core.Memory) {
  if (value.type !== types.LIST) {
    throw core.DataTypeError
  }
  if (!value.resolved) {
    throw core.libError('unexpected list not resolved')
  }
  mem.vars.set(variable.name, value)
}

function visitListIndex (assignable: types.ListIndex, value: types.ValueResolved, mem: core.Memory) {
  const list = expression.evaluate(assignable.list, mem)
  const index = expression.evaluate(assignable.index, mem)
  if (list.type !== types.LIST) {
    throw core.libError('unexpected type for value, should be list')
  }
  if (index.type !== types.NUMBER) {
    throw core.DataTypeError
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw core.InvalidDimError
  }
  const storedList = mem.vars.get(assignable.list.name)
  if (storedList?.type !== types.LIST) {
    throw core.libError('unexpected type, should be list')
  }
  if (value.type !== types.NUMBER) {
    throw core.DataTypeError
  }
  if (!value.resolved) {
    throw core.libError('unexpected number not resolved, list index')
  }
  storedList.elements[index.float - 1] = value
}
