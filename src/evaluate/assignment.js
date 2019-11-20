// assignment
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import * as expression from './expression'

export function evaluate (assignable, value, mem) {
  const behavior = assignmentOf[assignable.type]
  if (behavior === undefined) {
    throw core.libError('unexpected assignable type')
  }
  return behavior(assignable, value, mem)
}

const assignmentOf = {}

// ----- Statements -----

assignmentOf[types.VARIABLE] = (assignable, value, mem) => {
  if (value.type !== types.NUMBER) {
    return
  }
  mem.vars[assignable.name] = value
}

assignmentOf[types.STRINGVARIABLE] = (assignable, value, mem) => {
  if (value.type !== types.STRING) {
    throw core.DataTypeError
  }
  mem.vars[assignable.name] = value
}

assignmentOf[types.LISTVARIABLE] = (assignable, value, mem) => {
  if (value.type !== types.LIST) {
    throw core.DataTypeError
  }
  mem.vars[assignable.name] = value
}

assignmentOf[types.LISTINDEX] = (assignable, value, mem) => {
  const list = expression.evaluate(assignable.list, mem)
  const index = expression.evaluate(assignable.index, mem)
  if (index.type !== types.NUMBER) {
    throw core.DataTypeError
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw core.InvalidDimError
  }
  mem.vars[assignable.list.name].elements[index.float - 1] = value
}
