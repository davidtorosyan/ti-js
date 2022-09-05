// statement
// =========

import * as core from '../common/core'
import * as signal from '../common/signal'
import * as types from '../common/types'
import * as parser from '../parse/parser'
import * as operation from './helper/operation'
import * as expression from './expression'
import * as assignment from './assignment'
import * as iolib from './helper/iolib'

export type State = {
  mem: core.Memory,
  resume: ((callback?: () => void) => void) | undefined,
  resumeCallback: (() => void) | undefined,
  debug: boolean,
  sourceLines: Array<string>,
  searchLabel: string | undefined,
  ifResult: boolean | undefined,
  incrementDecrementResult: boolean | undefined,
  maximumLines: number,
  linesRun: number,
  blockStack: Array<number>,
  falsyStackHeight: number | undefined,
  falsyBlockPreviousIf: boolean | undefined,
  i: number,
  lines: Array<types.Statement>,
  callback?: (status: string) => void
  frequencyMs: number
  status: string
  rows: number
  columns: number
  io: iolib.IoOptions
}

export function evaluate (line: types.Statement, state: State): string | undefined {
  switch (line.type) {
    case types.EmptyStatement:
      return visitEmptyStatement(line, state)
    case types.AssignmentStatement:
      return visitAssignmentStatement(line, state)
    case types.ValueStatement:
      return visitValueStatement(line, state)
    case types.SyntaxError:
      return visitSyntaxError(line, state)
    case types.IfStatement:
      return visitIfStatement(line, state)
    case types.ThenStatement:
      return visitThenStatement(line, state)
    case types.ElseStatement:
      return visitElseStatement(line, state)
    case types.ForLoop:
      return visitForLoop(line, state)
    case types.WhileLoop:
      return visitWhileLoop(line, state)
    case types.RepeatLoop:
      return visitRepeatLoop(line, state)
    case types.EndStatement:
      return visitEndStatement(line, state)
    case types.PauseStatement:
      return visitPauseStatement(line, state)
    case types.LabelStatement:
      return visitLabelStatement(line, state)
    case types.GotoStatement:
      return visitGotoStatement(line, state)
    case types.IncrementSkip:
      return visitIncrementSkip(line, state)
    case types.DecrementSkip:
      return visitDecrementSkip(line, state)
    case types.MenuStatement:
      return visitMenuStatement(line, state)
    case types.ProgramStatement:
      return visitProgramStatement(line, state)
    case types.ReturnStatement:
      return visitReturnStatement(line, state)
    case types.StopStatement:
      return visitStopStatement(line, state)
    case types.DelVarStatement:
      return visitDelVarStatement(line, state)
    case types.GraphStyleStatement:
      return visitGraphStyleStatement(line, state)
    case types.OpenLibStatement:
      return visitOpenLibStatement(line, state)
    case types.ExecLibStatement:
      return visitExecLibStatement(line, state)
    case types.Display:
      return visitDisplay(line, state)
    case types.Input:
      return visitInput(line, state)
    case types.Prompt:
      return visitPrompt(line, state)
    case types.DispGraph:
      return visitDispGraph(line, state)
    case types.DispTable:
      return visitDispTable(line, state)
    case types.Output:
      return visitOutput(line, state)
    case types.ClrHome:
      return visitClrHome(line, state)
    case types.ClrTable:
      return visitClrTable(line, state)
    case types.GetCalc:
      return visitGetCalc(line, state)
    case types.Get:
      return visitGet(line, state)
    case types.Send:
      return visitSend(line, state)
    default:
      return core.exhaustiveMatchingGuard(line)
  }
}

// ----- Statements -----

function visitEmptyStatement (_line: types.EmptyStatement, _state: State) {
  // do nothing
  return undefined
}

function visitAssignmentStatement (line: types.AssignmentStatement, state: State) {
  const value = expression.evaluate(line.value, state.mem)
  assignment.evaluate(line.assignable, value, state.mem)
  operation.assignAns(state.mem, value)
  return undefined
}

function visitValueStatement (line: types.ValueStatement, state: State) {
  operation.assignAns(state.mem, expression.evaluate(line.value, state.mem))
  return undefined
}

function visitSyntaxError (_line: types.SyntaxError, _state: State): never {
  throw core.SyntaxError
}

// ----- CTL -----

function visitIfStatement (line: types.IfStatement, state: State) {
  if (line.value === null) {
    throw core.ArgumentError
  }
  state.ifResult = operation.isTruthy(expression.evaluate(line.value, state.mem))
  return undefined
}

function visitThenStatement (_line: types.ThenStatement, _state: State): never {
  throw core.SyntaxError
}

function visitElseStatement (_line: types.ElseStatement, state: State) {
  const previousBlockIndex = state.blockStack.pop()
  if (previousBlockIndex === undefined) {
    throw core.SyntaxError
  }
  const previousBlockLine = state.lines[previousBlockIndex]
  if (previousBlockLine === undefined) {
    throw core.libError('Else blockstack led to missing line!')
  }
  if (previousBlockLine.type === types.ThenStatement) {
    state.blockStack.push(state.i)
    state.falsyStackHeight = state.blockStack.length
  } else {
    throw core.SyntaxError
  }
  return undefined
}

function visitForLoop (line: types.ForLoop, state: State) {
  if (line.variable === null || line.start === null || line.end === null) {
    throw core.ArgumentError
  }

  const value = expression.evaluate(line.start, state.mem)
  assignment.evaluate(line.variable, value, state.mem)

  state.blockStack.push(state.i)
  if (!operation.isTruthy(expression.evaluate(operation.binaryOperation(line.variable, '<=', line.end), state.mem))) {
    state.falsyStackHeight = state.blockStack.length
  }
  return undefined
}

function visitWhileLoop (line: types.WhileLoop, state: State) {
  if (line.value === null) {
    throw core.ArgumentError
  }
  state.blockStack.push(state.i)
  if (!operation.isTruthy(expression.evaluate(line.value, state.mem))) {
    state.falsyStackHeight = state.blockStack.length
  }
  return undefined
}

function visitRepeatLoop (line: types.RepeatLoop, state: State) {
  if (line.value === null) {
    throw core.ArgumentError
  }
  state.blockStack.push(state.i)
  return undefined
}

function visitEndStatement (_line: types.EndStatement, state: State) {
  const source = state.blockStack.pop()
  if (source === undefined) {
    throw core.SyntaxError
  }
  const sourceLine = state.lines[source]
  if (sourceLine === undefined) {
    throw core.libError('End blockstack led to missing line!')
  }

  switch (sourceLine?.type) {
    case types.ForLoop:
      if (sourceLine.end === null) {
        throw core.libError('End blockstack led to invalid For!')
      }
      increment(state.mem, sourceLine.variable, sourceLine.step !== null ? sourceLine.step : core.ONE)
      if (operation.isTruthy(
        expression.evaluate(operation.binaryOperation(sourceLine.variable, '<=', sourceLine.end), state.mem),
      )) {
        state.blockStack.push(source)
        state.i = source
      }
      break
    case types.WhileLoop:
    case types.RepeatLoop:
      if (sourceLine.value === null) {
        throw core.libError('End blockstack led to invalid While/Repeat!')
      }
      if (operation.isTruthy(expression.evaluate(sourceLine.value, state.mem))) {
        state.blockStack.push(source)
        state.i = source
      }
      break
    case types.ThenStatement:
    case types.ElseStatement:
      break
    default:
      throw core.libError(`impossibleEndFrom'${sourceLine.type}`)
  }

  return undefined
}

function visitPauseStatement (_line: types.PauseStatement, _state: State): never {
  throw core.UnimplementedError
}

function visitLabelStatement (_line: types.LabelStatement, _state: State) {
  // do nothing
  return undefined
}

function visitGotoStatement (line: types.GotoStatement, state: State) {
  state.searchLabel = line.location
  state.i = -1
  return undefined
}

function visitIncrementSkip (line: types.IncrementSkip, state: State) {
  if (line.variable === null || line.end === null) {
    throw core.ArgumentError
  }
  increment(state.mem, line.variable, core.ONE)
  state.incrementDecrementResult = operation.isTruthy(
    expression.evaluate(operation.binaryOperation(line.variable, '<=', line.end), state.mem),
  )
  return undefined
}

function visitDecrementSkip (line: types.DecrementSkip, state: State) {
  if (line.variable === null || line.end === null) {
    throw core.ArgumentError
  }
  increment(state.mem, line.variable, core.MINUSONE)
  state.incrementDecrementResult = operation.isTruthy(
    expression.evaluate(operation.binaryOperation(line.variable, '>=', line.end), state.mem),
  )
  return undefined
}

function visitMenuStatement (line: types.MenuStatement, state: State) {
  if (line.title === null || line.choices.length === 0 || line.choices.length > 7) {
    throw core.ArgumentError
  }
  iolib.stdout(operation.valueToString(expression.evaluate(line.title, state.mem), true), state.io)
  line.choices.forEach((choice, idx) => {
    iolib.stdout(`${idx + 1}:${operation.valueToString(choice.option)}`, state.io)
  })
  iolib.onStdin(input => {
    const digit = operation.parseDigit(input)
    if (digit === undefined) {
      return true
    }
    const choice = line.choices[digit - 1]
    if (choice === undefined) {
      return true
    }
    state.searchLabel = choice.location
    state.i = 0
    if (state.resume === undefined) {
      throw core.libError('resume not defined')
    }
    state.resume()
    return false
  }, state.io)
  return signal.SUSPEND
}

function visitProgramStatement (_line: types.ProgramStatement, _state: State): never {
  throw core.UnimplementedError
}

function visitReturnStatement (_line: types.ReturnStatement, _state: State) {
  // TODO interaction with subprograms
  return signal.DONE
}

function visitStopStatement (_line: types.StopStatement, _state: State) {
  return signal.DONE
}

function visitDelVarStatement (line: types.DelVarStatement, state: State) {
  if (line.variable === null) {
    throw core.ArgumentError
  }
  operation.deleteVariable(state.mem, line.variable)
  return undefined
}

function visitGraphStyleStatement (_line: types.GraphStyleStatement, _state: State): never {
  throw core.UnimplementedError
}

function visitOpenLibStatement (_line: types.OpenLibStatement, _state: State): never {
  throw core.UnimplementedError
}

function visitExecLibStatement (_line: types.ExecLibStatement, _state: State): never {
  throw core.UnimplementedError
}

// ----- I/O -----

function visitDisplay (line: types.Display, state: State) {
  if (line.value !== null) {
    iolib.stdout(operation.valueToString(expression.evaluate(line.value, state.mem)), state.io)
  }
  return undefined
}

function visitInput (line: types.Input, state: State) {
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

function visitPrompt (line: types.Prompt, state: State) {
  if (line.variable === null) {
    throw core.ArgumentError
  }
  const text = operation.variableToString(line.variable)
  return getInput(`${text}=?`, line.variable, state, false)
}

function visitDispGraph (_line: types.DispGraph, _state: State): never {
  throw core.UnimplementedError
}

function visitDispTable (_line: types.DispTable, _state: State): never {
  throw core.UnimplementedError
}

function visitOutput (line: types.Output, state: State) {
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
  return undefined
}

function visitClrHome (_line: types.ClrHome, _state: State): never {
  throw core.UnimplementedError
}

function visitClrTable (_line: types.ClrTable, _state: State): never {
  throw core.UnimplementedError
}

function visitGetCalc (_line: types.GetCalc, _state: State): never {
  throw core.UnimplementedError
}

function visitGet (_line: types.Get, _state: State): never {
  throw core.UnimplementedError
}

function visitSend (_line: types.Send, _state: State): never {
  throw core.UnimplementedError
}

// ----- Helpers -----

function increment (mem: core.Memory, variable: types.Variable, step: types.ValueExpression) {
  if (!operation.hasVariable(mem, variable)) {
    throw core.UndefinedError
  }

  const value = expression.evaluate({
    type: types.BINARY,
    operator: '+',
    left: variable,
    right: step,
  }, mem)

  assignment.evaluate(variable, value, mem)
}

function getInput (text: string, variable: types.Variable, state: State, allowStringLiterals: boolean) {
  iolib.stdout(text, state.io, false)
  iolib.onStdin(input => {
    if (input === null || input === undefined || input === '') {
      return true
    }
    if (state.resume === undefined) {
      throw core.libError('resume not defined')
    }
    state.resume(() => {
      iolib.stdout(input, state.io)

      let value: types.ValueResolved
      if (variable.type === types.STRINGVARIABLE && allowStringLiterals) {
        value = { type: types.STRING, chars: input }
      } else {
        value = expression.evaluate(parser.parseExpression(input), state.mem)
      }

      // special case where a prompt for a numerical variable is interpreted as a list variable
      if (variable.type === types.VARIABLE && value.type === types.LIST) {
        variable = { type: types.LISTVARIABLE, name: `List${variable.name}`, custom: true }
      }

      assignment.evaluate(variable, value, state.mem)
    })
    return false
  }, state.io)
  return signal.SUSPEND
}
