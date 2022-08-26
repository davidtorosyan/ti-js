// types
// =====

// ----- Errors -----

export const ti = 'ti'
export const lib = 'lib'
export const SyntaxError = 'SyntaxError'

export type SyntaxError = {
    type: typeof SyntaxError
}

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

export type EmptyStatement = {
    type: typeof EmptyStatement
}

export type ValueStatement = {
    type: typeof ValueStatement
    value: ValueExpression
}

export type AssignmentStatement = {
    type: typeof AssignmentStatement
    value: ValueExpression
    assignable: Assignable
}

// ----- CTL -----

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

export type IfStatement = {
    type: typeof IfStatement
    value: ValueExpression | null
    extra: boolean | null
}

export type ThenStatement = {
    type: typeof ThenStatement
    extra: boolean | null
}

export type ElseStatement = {
    type: typeof ElseStatement
    extra: boolean | null
}

export type ForLoop = {
    type: typeof ForLoop
    variable: Variable
    start: ValueExpression | null
    end: ValueExpression | null
    step: ValueExpression | null
    args: boolean
    extra: boolean | null
}

export type WhileLoop = {
    type: typeof WhileLoop
    value: ValueExpression | null
    extra: boolean | null
}

export type RepeatLoop = {
    type: typeof RepeatLoop
    value: ValueExpression | null
    extra: boolean | null
}

export type EndStatement = {
    type: typeof EndStatement
    extra: boolean | null
}

export type PauseStatement = {
    type: typeof PauseStatement
}

export type LabelStatement = {
    type: typeof LabelStatement
    location: string
}

export type GotoStatement = {
    type: typeof GotoStatement
    location: string
}

export type IncrementSkip = {
    type: typeof IncrementSkip
    variable: Variable | null
    end: ValueExpression | null
}

export type DecrementSkip = {
    type: typeof DecrementSkip
    variable: Variable | null
    end: ValueExpression | null
}

export type MenuChoice = {
    option: String
    location: string
}

export type MenuStatement = {
    type: typeof MenuStatement
    title: ValueExpression | null
    choices: Array<MenuChoice>
}

export type ProgramStatement = {
    type: typeof ProgramStatement
    name: string
}

export type ReturnStatement = {
    type: typeof ReturnStatement
}

export type StopStatement = {
    type: typeof StopStatement
}

export type DelVarStatement = {
    type: typeof DelVarStatement
    variable: Variable | null
}

export type GraphStyleStatement = {
    type: typeof GraphStyleStatement
    equation: ValueExpression | null
    style: ValueExpression | null
}

export type OpenLibStatement = {
    type: typeof OpenLibStatement
    name: string
}

export type ExecLibStatement = {
    type: typeof ExecLibStatement
    name: string
}

export type CtlStatement
    = IfStatement
    | ThenStatement
    | ElseStatement
    | ForLoop
    | WhileLoop
    | RepeatLoop
    | EndStatement
    | PauseStatement
    | LabelStatement
    | GotoStatement
    | IncrementSkip
    | DecrementSkip
    | MenuStatement
    | ProgramStatement
    | ReturnStatement
    | StopStatement
    | DelVarStatement
    | GraphStyleStatement
    | OpenLibStatement
    | ExecLibStatement

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

export type Input = {
    type: typeof Input
    text: ValueExpression | null
    variable: Variable | null
}

export type Prompt = {
    type: typeof Prompt
    variable: Variable | null
}

export type Display = {
    type: typeof Display
    value: ValueExpression | null
}

export type DispGraph = {
    type: typeof DispGraph
}

export type DispTable = {
    type: typeof DispTable
}

export type Output = {
    type: typeof Output
    row: ValueExpression | null
    column: ValueExpression | null
    value: ValueExpression | null
}

export type ClrHome = {
    type: typeof ClrHome
}

export type ClrTable = {
    type: typeof ClrTable
}

export type GetCalc = {
    type: typeof GetCalc
    variable: Variable | null
    portflag: ValueExpression | null
}

export type Get = {
    type: typeof Get
    variable: Variable | null
}

export type Send = {
    type: typeof Send
    variable: Variable | null
}


export type IoStatement
    = Input
    | Prompt
    | Display
    | DispGraph
    | DispTable
    | Output
    | ClrHome
    | ClrTable
    | GetCalc
    | Get
    | Send

export type Statement
    = EmptyStatement
    | SyntaxError
    | AssignmentStatement
    | CtlStatement
    | IoStatement
    | ValueStatement