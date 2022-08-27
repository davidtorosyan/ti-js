// types
// =====

// ----- Errors -----

export const ti = 'ti'
export const lib = 'lib'
export const SyntaxError = 'SyntaxError'

export type SyntaxError = {
    type: typeof SyntaxError
    source?: string
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

export type TiNumber =
    NumberLiteral
    | NumberResolved

export type TiString = {
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

export type TiList =
    ListLiteral
    | ListResolved

export type ValueResolved =
    NumberResolved
    | TiString
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
    TiNumber
    | TiString
    | TiList
    | Assignable
    | BinaryExpression
    | UnaryExpression

// ----- Statements -----

export const EmptyStatement = 'empty'
export const ValueStatement = 'value'
export const AssignmentStatement = 'assign'

export type EmptyStatement = {
    type: typeof EmptyStatement
    source?: string
}

export type ValueStatement = {
    type: typeof ValueStatement
    value: ValueExpression
    source?: string
}

export type AssignmentStatement = {
    type: typeof AssignmentStatement
    source?: string
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
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

export type ThenStatement = {
    type: typeof ThenStatement
    source?: string
    extra: boolean | null
}

export type ElseStatement = {
    type: typeof ElseStatement
    source?: string
    extra: boolean | null
}

export type ForLoop = {
    type: typeof ForLoop
    source?: string
    variable: Variable
    start: ValueExpression | null
    end: ValueExpression | null
    step: ValueExpression | null
    args: boolean
    extra: boolean | null
}

export type WhileLoop = {
    type: typeof WhileLoop
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

export type RepeatLoop = {
    type: typeof RepeatLoop
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

export type EndStatement = {
    type: typeof EndStatement
    source?: string
    extra: boolean | null
}

export type PauseStatement = {
    type: typeof PauseStatement
    source?: string
}

export type LabelStatement = {
    type: typeof LabelStatement
    source?: string
    location: string
}

export type GotoStatement = {
    type: typeof GotoStatement
    source?: string
    location: string
}

export type IncrementSkip = {
    type: typeof IncrementSkip
    source?: string
    variable: Variable | null
    end: ValueExpression | null
}

export type DecrementSkip = {
    type: typeof DecrementSkip
    source?: string
    variable: Variable | null
    end: ValueExpression | null
}

export type MenuChoice = {
    option: TiString
    location: string
}

export type MenuStatement = {
    type: typeof MenuStatement
    source?: string
    title: ValueExpression | null
    choices: Array<MenuChoice>
}

export type ProgramStatement = {
    type: typeof ProgramStatement
    source?: string
    name: string
}

export type ReturnStatement = {
    type: typeof ReturnStatement
    source?: string
}

export type StopStatement = {
    type: typeof StopStatement
    source?: string
}

export type DelVarStatement = {
    type: typeof DelVarStatement
    source?: string
    variable: Variable | null
}

export type GraphStyleStatement = {
    type: typeof GraphStyleStatement
    source?: string
    equation: ValueExpression | null
    style: ValueExpression | null
}

export type OpenLibStatement = {
    type: typeof OpenLibStatement
    source?: string
    name: string
}

export type ExecLibStatement = {
    type: typeof ExecLibStatement
    source?: string
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
    source?: string
    text: ValueExpression | null
    variable: Variable | null
}

export type Prompt = {
    type: typeof Prompt
    source?: string
    variable: Variable | null
}

export type Display = {
    type: typeof Display
    source?: string
    value: ValueExpression | null
}

export type DispGraph = {
    type: typeof DispGraph
    source?: string
}

export type DispTable = {
    type: typeof DispTable
    source?: string
}

export type Output = {
    type: typeof Output
    source?: string
    row: ValueExpression | null
    column: ValueExpression | null
    value: ValueExpression | null
}

export type ClrHome = {
    type: typeof ClrHome
    source?: string
}

export type ClrTable = {
    type: typeof ClrTable
    source?: string
}

export type GetCalc = {
    type: typeof GetCalc
    source?: string
    variable: Variable | null
    portflag: ValueExpression | null
}

export type Get = {
    type: typeof Get
    source?: string
    variable: Variable | null
}

export type Send = {
    type: typeof Send
    source?: string
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