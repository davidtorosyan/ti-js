// assignment
// ==========

import * as core from '../common/core'
import * as types from '../common/types'
import type { Assignable, ValueResolved } from '../common/types'
import * as expression from './expression'

export function evaluate(assignable: Assignable, value: ValueResolved, mem: any) {
  const behavior = assignmentOf.get(assignable.type)
  if (behavior === undefined) {
    throw core.libError('unexpected assignable type')
  }
  return behavior(assignable, value, mem)
}

type AssignmentBehavior = (assignable: Assignable, value: ValueResolved, mem: any) => void

const assignmentOf = new Map<string, AssignmentBehavior>()

// ----- Statements -----

assignmentOf.set(types.VARIABLE, (assignable, value, mem) => {
  if (assignable.type !== types.VARIABLE) {
    throw core.libError('unexpected assignable type')
  }
  if (value.type !== types.NUMBER) {
    return
  }
  mem.vars[assignable.name] = value
})

assignmentOf.set(types.STRINGVARIABLE, (assignable, value, mem) => {
  if (assignable.type !== types.STRINGVARIABLE) {
    throw core.libError('unexpected assignable type')
  }
  if (value.type !== types.STRING) {
    throw core.DataTypeError
  }
  mem.vars[assignable.name] = value
})

assignmentOf.set(types.LISTVARIABLE, (assignable, value, mem) => {
  if (assignable.type !== types.LISTVARIABLE) {
    throw core.libError('unexpected assignable type')
  }
  if (value.type !== types.LIST) {
    throw core.DataTypeError
  }
  if (!value.resolved) {
    throw core.libError('unexpected list not resolved')
  }
  mem.vars[assignable.name] = value
})

assignmentOf.set(types.LISTINDEX, (assignable, value, mem) => {
  if (assignable.type !== types.LISTINDEX) {
    throw core.libError('unexpected assignable type')
  }
  const list = expression.evaluate(assignable.list, mem)
  const index = expression.evaluate(assignable.index, mem)
  if (index.type !== types.NUMBER) {
    throw core.DataTypeError
  }
  if (index.float < 1 || index.float > list.elements.length) {
    throw core.InvalidDimError
  }
  mem.vars[assignable.list.name].elements[index.float - 1] = value
})
