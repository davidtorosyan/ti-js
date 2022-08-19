// statement
// =========

import * as core from '../common/core'
import * as signal from '../common/signal'
import * as types from '../common/types'
import * as parser from '../parse/parser'
import * as operation from './operation'
import * as expression from './expression'
import * as assignment from './assignment'
import * as iolib from './iolib'

export function evaluate (line, state) {
  const behavior = statementOf[line.type]
  if (behavior === undefined) {
    throw core.libError('unexpected')
  }
  return behavior(line, state)
}

const statementOf = {}

// ----- Statements -----

statementOf[types.EmptyStatement] = (line, state) => {
  // do nothing
}

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
  throw core.UnimplementedError
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
  iolib.stdout(operation.valueToString(expression.evaluate(line.title, state.mem), true), state.io)
  line.choices.forEach((choice, idx) => {
    iolib.stdout(`${idx + 1}:${operation.valueToString(choice.option)}`, state.io)
  })
  iolib.onStdin(input => {
    const digit = operation.parseDigit(input)
    if (digit === undefined || digit === 0 || digit > line.choices.length) {
      return true
    }
    state.searchLabel = line.choices[digit - 1].location
    state.i = 0
    state.resume()
  }, state.io)
  return signal.SUSPEND
}

statementOf[types.ProgramStatement] = (line, state) => {
  throw core.UnimplementedError
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
  throw core.UnimplementedError
}

statementOf[types.OpenLibStatement] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.ExecLibStatement] = (line, state) => {
  throw core.UnimplementedError
}

// ----- I/O -----

statementOf[types.Display] = (line, state) => {
  if (line.value !== null) {
    iolib.stdout(operation.valueToString(expression.evaluate(line.value, state.mem)), state.io)
  }
}

statementOf[types.Input] = (line, state) => {
  if (line.variable === null) {
    if (line.text !== null) {
      throw core.ArgumentError
    }
    throw core.UnimplementedError
  }
  let text = '?'
  if (line.text !== null) {
    text = operation.valueToString(expression.evaluate(line.text, state.mem), true)
  }
  return getInput(text, line.variable, state, true)
}

statementOf[types.Prompt] = (line, state) => {
  if (line.variable === null) {
    throw core.ArgumentError
  }
  const text = operation.variableToString(line.variable)
  return getInput(`${text}=?`, line.variable, state, false)
}

statementOf[types.DispGraph] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.DispTable] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.Output] = (line, state) => {
  if (line.row === null || line.column === null || line.value === null) {
    throw core.ArgumentError
  }
  const row = expression.evaluate(line.row, state.mem)
  const column = expression.evaluate(line.column, state.mem)
  if (row.type !== types.NUMBER || column.type !== types.NUMBER) {
    throw core.DataTypeError
  }
  if (row.float < 1 || row.float > state.rows || column.float < 1 || column.float > state.columns) {
    throw core.DomainError
  }
  // TODO: respect rows and columns
  iolib.stdout(operation.valueToString(expression.evaluate(line.value, state.mem)), state.io)
}

statementOf[types.ClrHome] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.ClrTable] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.GetCalc] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.Get] = (line, state) => {
  throw core.UnimplementedError
}

statementOf[types.Send] = (line, state) => {
  throw core.UnimplementedError
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
    right: step,
  }, mem), mem)
}

function getInput (text, variable, state, allowStringLiterals) {
  iolib.stdout(text, state.io, false)
  iolib.onStdin(input => {
    if (input === null || input === undefined || input === '') {
      return true
    }
    state.resume(() => {
      iolib.stdout(input, state.io)

      let value
      if (variable.type === types.STRINGVARIABLE && allowStringLiterals) {
        value = { type: types.STRING, chars: input }
      } else {
        value = expression.evaluate(parser.parseExpression(input), state.mem)
      }

      // special case where a prompt for a numerical variable is interpreted as a list variable
      if (variable.type === types.VARIABLE && value.type === types.LIST) {
        variable = { type: types.LISTVARIABLE, name: `List${variable.name}`, custom: true }
      }

      operation.assignVariable(state.mem, variable, value)
    })
  }, state.io)
  return signal.SUSPEND
}
