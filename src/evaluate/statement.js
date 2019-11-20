// statement
// =========

import * as signal from '../common/signal'
import * as core from '../common/core'
import * as types from '../common/types'
import * as parser from '../parse/parser'
import * as operation from './operation'
import * as expression from './expression'
import * as assignment from './assignment'

export function evaluate (line, state) {
  const behavior = statementOf[line.type]
  if (behavior === undefined) {
    throw core.libError('unexpected')
  }
  return behavior(line, state)
}

const statementOf = {}

// ----- Statements -----

statementOf[types.AssignmentStatement] = (line, state) => {
  const value = expression.evaluate(line.value, state.mem)
  assignment.evaluate(line.assignable, value, state.mem)
  operation.assignAns(state.mem, value)
}

statementOf[types.ValueStatement] = (line, state) => {
  operation.assignAns(state.mem, expression.evaluate(line.value, state.mem))
}

statementOf[types.SyntaxError] = (line, state) => {
  throw core.SyntaxError
}

// ----- CTL -----

statementOf[types.IfStatement] = (line, state) => {
  if (line.value === null) {
    throw core.ArgumentError
  }
  state.ifResult = operation.isTruthy(expression.evaluate(line.value, state.mem))
}

statementOf[types.ThenStatement] = (line, state) => {
  throw core.SyntaxError
}

statementOf[types.ElseStatement] = (line, state) => {
  if (state.blockStack.length === 0) {
    throw core.SyntaxError
  }
  if (state.lines[state.blockStack.pop()].type === types.ThenStatement) {
    state.blockStack.push(state.i)
    state.falsyStackHeight = state.blockStack.length
  } else {
    throw core.SyntaxError
  }
}

statementOf[types.ForLoop] = (line, state) => {
  if (line.variable === null || line.start === null || line.end === null) {
    throw core.ArgumentError
  }
  operation.assignVariable(state.mem, line.variable, expression.evaluate(line.start, state.mem))
  state.blockStack.push(state.i)
  if (!operation.isTruthy(expression.evaluate(operation.binaryOperation(line.variable, '<=', line.end), state.mem))) {
    state.falsyStackHeight = state.blockStack.length
  }
}

statementOf[types.WhileLoop] = (line, state) => {
  if (line.value === null) {
    throw core.ArgumentError
  }
  state.blockStack.push(state.i)
  if (!operation.isTruthy(expression.evaluate(line.value, state.mem))) {
    state.falsyStackHeight = state.blockStack.length
  }
}

statementOf[types.RepeatLoop] = (line, state) => {
  if (line.value === null) {
    throw core.ArgumentError
  }
  state.blockStack.push(state.i)
}

statementOf[types.EndStatement] = (line, state) => {
  if (state.blockStack.length === 0) {
    throw core.SyntaxError
  }
  const source = state.blockStack.pop()
  const sourceLine = state.lines[source]
  if (sourceLine.type === types.ForLoop ||
              sourceLine.type === types.WhileLoop ||
              sourceLine.type === types.RepeatLoop) {
    if (sourceLine.type === types.ForLoop) {
      increment(state.mem, sourceLine.variable, sourceLine.step !== null ? sourceLine.step : core.ONE)
      if (operation.isTruthy(expression.evaluate(operation.binaryOperation(sourceLine.variable, '<=', sourceLine.end), state.mem))) {
        state.blockStack.push(source)
        state.i = source
      }
    } else if (operation.isTruthy(expression.evaluate(sourceLine.value, state.mem))) {
      state.blockStack.push(source)
      state.i = source
    }
  } else if (sourceLine.type === types.ThenStatement ||
                  sourceLine.type === types.ElseStatement) {
    // empty
  } else {
    throw core.libError(`impossibleEndFrom'${sourceLine.type}`)
  }
}

statementOf[types.PauseStatement] = (line, state) => {
  throw core.libError('unimplemented')
}

statementOf[types.LabelStatement] = (line, state) => {
}

statementOf[types.GotoStatement] = (line, state) => {
  state.searchLabel = line.location
  state.i = -1
}

statementOf[types.IncrementSkip] = (line, state) => {
  if (line.variable === null || line.end === null) {
    throw core.ArgumentError
  }
  increment(state.mem, line.variable, core.ONE)
  state.incrementDecrementResult = operation.isTruthy(expression.evaluate(operation.binaryOperation(line.variable, '<=', line.end), state.mem))
}

statementOf[types.DecrementSkip] = (line, state) => {
  if (line.variable === null || line.end === null) {
    throw core.ArgumentError
  }
  increment(state.mem, line.variable, core.MINUSONE)
  state.incrementDecrementResult = operation.isTruthy(expression.evaluate(operation.binaryOperation(line.variable, '>=', line.end), state.mem))
}

statementOf[types.MenuStatement] = (line, state) => {
  if (line.title === null || line.choices.length === 0 || line.choices.length > 7) {
    throw core.ArgumentError
  }
  state.io.stdout(operation.valueToString(expression.evaluate(line.title, state.mem), true))
  line.choices.forEach((choice, idx) => {
    state.io.stdout(`${idx + 1}:${operation.valueToString(choice.option)}`)
  })
  state.io.onStdin(input => {
    const digit = operation.parseDigit(input)
    if (digit === undefined || digit === 0 || digit > line.choices.length) {
      return true
    }
    state.searchLabel = line.choices[digit - 1].location
    state.i = 0
    state.resume()
  })
  return signal.SUSPEND
}

statementOf[types.ProgramStatement] = (line, state) => {
  // TODO implement
  throw core.libError('unimplemented')
}

statementOf[types.ReturnStatement] = (line, state) => {
  // TODO interaction with subprograms
  return signal.DONE
}

statementOf[types.StopStatement] = (line, state) => {
  return signal.DONE
}

statementOf[types.DelVarStatement] = (line, state) => {
  if (line.variable === null) {
    throw core.ArgumentError
  }
  operation.deleteVariable(state.mem, line.variable)
}

statementOf[types.GraphStyleStatement] = (line, state) => {
  throw core.libError('unimplemented')
}

statementOf[types.OpenLibStatement] = (line, state) => {
  throw core.libError('unimplemented')
}

statementOf[types.ExecLibStatement] = (line, state) => {
  throw core.libError('unimplemented')
}

// ----- I/O -----

statementOf[types.Display] = (line, state) => {
  if (line.value !== null) {
    state.io.stdout(operation.valueToString(expression.evaluate(line.value, state.mem)))
  }
}

statementOf[types.Prompt] = (line, state) => {
  if (line.variable === null) {
    throw core.ArgumentError
  }
  state.io.stdout(`${line.variable.name}=?`, false)
  state.io.onStdin(input => state.resume(() => {
    if (input === null || input === undefined || input === '') {
      state.io.stdout('')
      throw core.SyntaxErrorHiddenSource
    }
    state.io.stdout(input)
    operation.assignVariable(state.mem, line.variable, expression.evaluate(parser.parseExpression(input), state.mem))
  }))
  return signal.SUSPEND
}

// ----- Helpers -----

function increment (mem, variable, step) {
  if (!operation.hasVariable(mem, variable)) {
    throw core.UndefinedError
  }
  operation.assignVariable(mem, variable, expression.evaluate({
    type: types.BINARY,
    operator: '+',
    left: variable,
    right: step
  }, mem), mem)
}
