// types
// =====

// ----- Errors -----

export const ti = 'ti'
export const lib = 'lib'
export const SyntaxError = 'SyntaxError'

// ----- Values -----

export const NUMBER = 'number'
export const LIST = 'list'
export const STRING = 'string'

export const ListVariablePrefix = 'List'

export type NumberLiteral = {
    type: typeof NUMBER
    resolved: false
    integer?: number
    fraction?: number | null
    exponent?: number | null
}

export type NumberResolved = {
    type: typeof NUMBER
    resolved: true
    float: number
}

export type Number =
    NumberLiteral
    | NumberResolved

export type String = {
    type: typeof STRING
    chars: string
}

export type ListLiteral = {
    type: typeof LIST
    resolved: false
    elements: Array<ValueExpression>
}

export type ListResolved = {
    type: typeof LIST
    resolved: true
    elements: Array<NumberResolved>
}

export type List =
    ListLiteral
    | ListResolved

export type ValueResolved =
    NumberResolved
    | String
    | ListResolved

// ----- Tokens -----

export const ANS = 'ans'
export const GetKey = 'GetKey'

// ----- Variables -----

export const VARIABLE = 'variable'
export const STRINGVARIABLE = 'stringVariable'
export const LISTVARIABLE = 'listVariable'
export const LISTINDEX = 'listIndex'

export type NumericVariable = {
    type: 'variable'
    name: string
}

export type StringVariable = {
    type: 'stringVariable'
    name: string
}

export type ListVariable = {
    type: 'listVariable'
    name: string
    custom: boolean
}

export type ListIndex = {
    type: 'listIndex'
    list: ListVariable
    index: ValueExpression
}

export type Variable =
    NumericVariable
    | StringVariable
    | ListVariable

export type Assignable =
    Variable
    | ListIndex

// ----- Expressions -----

export const BINARY = 'binary'
export const UNARY = 'unary'

export type BinaryExpression = {
    type: typeof BINARY
    operator: string
    left: ValueExpression
    right: ValueExpression
}

export type UnaryExpression = {
    type: typeof UNARY
    operator: string
    argument: ValueExpression
}

export type ValueExpression =
    Number
    | String
    | List
    | Assignable
    | BinaryExpression
    | UnaryExpression

// ----- Statements -----

export const EmptyStatement = 'empty'
export const ValueStatement = 'value'
export const AssignmentStatement = 'assign'

// ----- CTL -----

type IfStatement = {
    name: string
}

export const IfStatement = 'IfStatement'
export const ThenStatement = 'ThenStatement'
export const ElseStatement = 'ElseStatement'
export const ForLoop = 'ForLoop'
export const WhileLoop = 'WhileLoop'
export const RepeatLoop = 'RepeatLoop'
export const EndStatement = 'EndStatement'
export const PauseStatement = 'PauseStatement'
export const LabelStatement = 'LabelStatement'
export const GotoStatement = 'GotoStatement'
export const IncrementSkip = 'IncrementSkip'
export const DecrementSkip = 'DecrementSkip'
export const MenuStatement = 'MenuStatement'
export const ProgramStatement = 'ProgramStatement'
export const ReturnStatement = 'ReturnStatement'
export const StopStatement = 'StopStatement'
export const DelVarStatement = 'DelVarStatement'
export const GraphStyleStatement = 'GraphStyleStatement'
export const OpenLibStatement = 'OpenLibStatement'
export const ExecLibStatement = 'ExecLibStatement'

// ----- I/O -----

export const Input = 'Input'
export const Prompt = 'Prompt'
export const Display = 'display'
export const DispGraph = 'DispGraph'
export const DispTable = 'DispTable'
export const Output = 'Output'
export const ClrHome = 'ClrHome'
export const ClrTable = 'ClrTable'
export const GetCalc = 'GetCalc'
export const Get = 'Get'
export const Send = 'Send'
