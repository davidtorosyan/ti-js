// types
// =====

/* eslint-disable no-use-before-define */

// ----- Errors -----

/**
 * @alpha
 */
export const ti = 'ti'
/**
 * @alpha
 */
export const lib = 'lib'
/**
 * @alpha
 */
export const SyntaxError = 'SyntaxError'

/**
 * @alpha
 */
export type SyntaxError = {
    type: typeof SyntaxError
    source?: string
}

// ----- Values -----

/**
 * @alpha
 */
export const NUMBER = 'number'
/**
 * @alpha
 */
export const LIST = 'list'
/**
 * @alpha
 */
export const STRING = 'string'

/**
 * @alpha
 */
export const ListVariablePrefix = 'List'

/**
 * @alpha
 */
export type NumberLiteral = {
    type: typeof NUMBER
    resolved: false
    integer?: number
    fraction?: number | null
    exponent?: number | null
}

/**
 * @alpha
 */
export type NumberResolved = {
    type: typeof NUMBER
    resolved: true
    float: number
}

/**
 * @alpha
 */
export type TiNumber =
    NumberLiteral
    | NumberResolved

/**
 * @alpha
 */
export type TiString = {
    type: typeof STRING
    chars: string
}

/**
 * @alpha
 */
export type ListLiteral = {
    type: typeof LIST
    resolved: false
    elements: Array<ValueExpression>
}

/**
 * @alpha
 */
export type ListResolved = {
    type: typeof LIST
    resolved: true
    elements: Array<NumberResolved>
}

/**
 * @alpha
 */
export type TiList =
    ListLiteral
    | ListResolved

/**
 * @alpha
 */
export type ValueResolved =
    NumberResolved
    | TiString
    | ListResolved

// ----- Tokens -----

/**
 * @alpha
 */
export const ANS = 'ans'
/**
 * @alpha
 */
export const GetKey = 'GetKey'

// ----- Variables -----

/**
 * @alpha
 */
export const VARIABLE = 'variable'
/**
 * @alpha
 */
export const STRINGVARIABLE = 'stringVariable'
/**
 * @alpha
 */
export const LISTVARIABLE = 'listVariable'
/**
 * @alpha
 */
export const LISTINDEX = 'listIndex'

/**
 * @alpha
 */
export type NumericVariable = {
    type: 'variable'
    name: string
}

/**
 * @alpha
 */
export type StringVariable = {
    type: 'stringVariable'
    name: string
}

/**
 * @alpha
 */
export type ListVariable = {
    type: 'listVariable'
    name: string
    custom: boolean
}

/**
 * @alpha
 */
export type ListIndex = {
    type: 'listIndex'
    list: ListVariable
    index: ValueExpression
}

/**
 * @alpha
 */
export type Variable =
    NumericVariable
    | StringVariable
    | ListVariable

/**
 * @alpha
 */
export type Assignable =
    Variable
    | ListIndex

// ----- Expressions -----

/**
 * @alpha
 */
export const BINARY = 'binary'
/**
 * @alpha
 */
export const UNARY = 'unary'

/**
 * @alpha
 */
export type BinaryExpression = {
    type: typeof BINARY
    operator: string
    left: ValueExpression
    right: ValueExpression
}

/**
 * @alpha
 */
export type UnaryExpression = {
    type: typeof UNARY
    operator: string
    argument: ValueExpression
}

/**
 * @alpha
 */
export type ValueExpression =
    TiNumber
    | TiString
    | TiList
    | Assignable
    | BinaryExpression
    | UnaryExpression

// ----- Statements -----

/**
 * @alpha
 */
export const EmptyStatement = 'empty'
/**
 * @alpha
 */
export const ValueStatement = 'value'
/**
 * @alpha
 */
export const AssignmentStatement = 'assign'

/**
 * @alpha
 */
export type EmptyStatement = {
    type: typeof EmptyStatement
    source?: string
}

/**
 * @alpha
 */
export type ValueStatement = {
    type: typeof ValueStatement
    value: ValueExpression
    source?: string
}

/**
 * @alpha
 */
export type AssignmentStatement = {
    type: typeof AssignmentStatement
    source?: string
    value: ValueExpression
    assignable: Assignable
}

// ----- CTL -----

/**
 * @alpha
 */
export const IfStatement = 'IfStatement'
/**
 * @alpha
 */
export const ThenStatement = 'ThenStatement'
/**
 * @alpha
 */
export const ElseStatement = 'ElseStatement'
/**
 * @alpha
 */
export const ForLoop = 'ForLoop'
/**
 * @alpha
 */
export const WhileLoop = 'WhileLoop'
/**
 * @alpha
 */
export const RepeatLoop = 'RepeatLoop'
/**
 * @alpha
 */
export const EndStatement = 'EndStatement'
/**
 * @alpha
 */
export const PauseStatement = 'PauseStatement'
/**
 * @alpha
 */
export const LabelStatement = 'LabelStatement'
/**
 * @alpha
 */
export const GotoStatement = 'GotoStatement'
/**
 * @alpha
 */
export const IncrementSkip = 'IncrementSkip'
/**
 * @alpha
 */
export const DecrementSkip = 'DecrementSkip'
/**
 * @alpha
 */
export const MenuStatement = 'MenuStatement'
/**
 * @alpha
 */
export const ProgramStatement = 'ProgramStatement'
/**
 * @alpha
 */
export const ReturnStatement = 'ReturnStatement'
/**
 * @alpha
 */
export const StopStatement = 'StopStatement'
/**
 * @alpha
 */
export const DelVarStatement = 'DelVarStatement'
/**
 * @alpha
 */
export const GraphStyleStatement = 'GraphStyleStatement'
/**
 * @alpha
 */
export const OpenLibStatement = 'OpenLibStatement'
/**
 * @alpha
 */
export const ExecLibStatement = 'ExecLibStatement'

/**
 * @alpha
 */
export type IfStatement = {
    type: typeof IfStatement
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export type ThenStatement = {
    type: typeof ThenStatement
    source?: string
    extra: boolean | null
}

/**
 * @alpha
 */
export type ElseStatement = {
    type: typeof ElseStatement
    source?: string
    extra: boolean | null
}

/**
 * @alpha
 */
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

/**
 * @alpha
 */
export type WhileLoop = {
    type: typeof WhileLoop
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export type RepeatLoop = {
    type: typeof RepeatLoop
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export type EndStatement = {
    type: typeof EndStatement
    source?: string
    extra: boolean | null
}

/**
 * @alpha
 */
export type PauseStatement = {
    type: typeof PauseStatement
    source?: string
}

/**
 * @alpha
 */
export type LabelStatement = {
    type: typeof LabelStatement
    source?: string
    location: string
}

/**
 * @alpha
 */
export type GotoStatement = {
    type: typeof GotoStatement
    source?: string
    location: string
}

/**
 * @alpha
 */
export type IncrementSkip = {
    type: typeof IncrementSkip
    source?: string
    variable: Variable | null
    end: ValueExpression | null
}

/**
 * @alpha
 */
export type DecrementSkip = {
    type: typeof DecrementSkip
    source?: string
    variable: Variable | null
    end: ValueExpression | null
}

/**
 * @alpha
 */
export type MenuChoice = {
    option: TiString
    location: string
}

/**
 * @alpha
 */
export type MenuStatement = {
    type: typeof MenuStatement
    source?: string
    title: ValueExpression | null
    choices: Array<MenuChoice>
}

/**
 * @alpha
 */
export type ProgramStatement = {
    type: typeof ProgramStatement
    source?: string
    name: string
}

/**
 * @alpha
 */
export type ReturnStatement = {
    type: typeof ReturnStatement
    source?: string
}

/**
 * @alpha
 */
export type StopStatement = {
    type: typeof StopStatement
    source?: string
}

/**
 * @alpha
 */
export type DelVarStatement = {
    type: typeof DelVarStatement
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
export type GraphStyleStatement = {
    type: typeof GraphStyleStatement
    source?: string
    equation: ValueExpression | null
    style: ValueExpression | null
}

/**
 * @alpha
 */
export type OpenLibStatement = {
    type: typeof OpenLibStatement
    source?: string
    name: string
}

/**
 * @alpha
 */
export type ExecLibStatement = {
    type: typeof ExecLibStatement
    source?: string
    name: string
}

/**
 * @alpha
 */
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

/**
 * @alpha
 */
export const Input = 'Input'
/**
 * @alpha
 */
export const Prompt = 'Prompt'
/**
 * @alpha
 */
export const Display = 'display'
/**
 * @alpha
 */
export const DispGraph = 'DispGraph'
/**
 * @alpha
 */
export const DispTable = 'DispTable'
/**
 * @alpha
 */
export const Output = 'Output'
/**
 * @alpha
 */
export const ClrHome = 'ClrHome'
/**
 * @alpha
 */
export const ClrTable = 'ClrTable'
/**
 * @alpha
 */
export const GetCalc = 'GetCalc'
/**
 * @alpha
 */
export const Get = 'Get'
/**
 * @alpha
 */
export const Send = 'Send'

/**
 * @alpha
 */
export type Input = {
    type: typeof Input
    source?: string
    text: ValueExpression | null
    variable: Variable | null
}

/**
 * @alpha
 */
export type Prompt = {
    type: typeof Prompt
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
export type Display = {
    type: typeof Display
    source?: string
    value: ValueExpression | null
}

/**
 * @alpha
 */
export type DispGraph = {
    type: typeof DispGraph
    source?: string
}

/**
 * @alpha
 */
export type DispTable = {
    type: typeof DispTable
    source?: string
}

/**
 * @alpha
 */
export type Output = {
    type: typeof Output
    source?: string
    row: ValueExpression | null
    column: ValueExpression | null
    value: ValueExpression | null
}

/**
 * @alpha
 */
export type ClrHome = {
    type: typeof ClrHome
    source?: string
}

/**
 * @alpha
 */
export type ClrTable = {
    type: typeof ClrTable
    source?: string
}

/**
 * @alpha
 */
export type GetCalc = {
    type: typeof GetCalc
    source?: string
    variable: Variable | null
    portflag: ValueExpression | null
}

/**
 * @alpha
 */
export type Get = {
    type: typeof Get
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
export type Send = {
    type: typeof Send
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
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

/**
 * @alpha
 */
export type Statement
    = EmptyStatement
    | SyntaxError
    | AssignmentStatement
    | CtlStatement
    | IoStatement
    | ValueStatement
