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
export interface SyntaxError {
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
export interface NumberLiteral {
    type: typeof NUMBER
    resolved: false
    integer?: number
    fraction?: number | null
    exponent?: number | null
}

/**
 * @alpha
 */
export interface NumberResolved {
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
export interface TiString {
    type: typeof STRING
    chars: string
}

/**
 * @alpha
 */
export interface ListLiteral {
    type: typeof LIST
    resolved: false
    elements: ValueExpression[]
}

/**
 * @alpha
 */
export interface ListResolved {
    type: typeof LIST
    resolved: true
    elements: NumberResolved[]
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

/**
 * @alpha
 */
export interface Ans {
    type: typeof ANS
}

/**
 * @alpha
 */
export interface GetKey {
    type: typeof GetKey
}

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
export interface NumericVariable {
    type: 'variable'
    name: string
}

/**
 * @alpha
 */
export interface StringVariable {
    type: 'stringVariable'
    name: string
}

/**
 * @alpha
 */
export interface ListVariable {
    type: 'listVariable'
    name: string
    custom: boolean
}

/**
 * @alpha
 */
export interface ListIndex {
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
export interface BinaryExpression {
    type: typeof BINARY
    operator: string
    left: ValueExpression
    right: ValueExpression
}

/**
 * @alpha
 */
export interface UnaryExpression {
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
    | SyntaxError
    | Ans
    | GetKey

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
export interface EmptyStatement {
    type: typeof EmptyStatement
    source?: string
}

/**
 * @alpha
 */
export interface ValueStatement {
    type: typeof ValueStatement
    value: ValueExpression
    source?: string
}

/**
 * @alpha
 */
export interface AssignmentStatement {
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
export interface IfStatement {
    type: typeof IfStatement
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export interface ThenStatement {
    type: typeof ThenStatement
    source?: string
    extra: boolean | null
}

/**
 * @alpha
 */
export interface ElseStatement {
    type: typeof ElseStatement
    source?: string
    extra: boolean | null
}

/**
 * @alpha
 */
export interface ForLoop {
    type: typeof ForLoop
    source?: string
    variable: Variable | null
    start: ValueExpression | null
    end: ValueExpression | null
    step: ValueExpression | null
    args: boolean
    extra: boolean | null
}

/**
 * @alpha
 */
export interface WhileLoop {
    type: typeof WhileLoop
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export interface RepeatLoop {
    type: typeof RepeatLoop
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export interface EndStatement {
    type: typeof EndStatement
    source?: string
    extra: boolean | null
}

/**
 * @alpha
 */
export interface PauseStatement {
    type: typeof PauseStatement
    source?: string
}

/**
 * @alpha
 */
export interface LabelStatement {
    type: typeof LabelStatement
    source?: string
    location: string
}

/**
 * @alpha
 */
export interface GotoStatement {
    type: typeof GotoStatement
    source?: string
    location: string
}

/**
 * @alpha
 */
export interface IncrementSkip {
    type: typeof IncrementSkip
    source?: string
    variable: Variable | null
    end: ValueExpression | null
}

/**
 * @alpha
 */
export interface DecrementSkip {
    type: typeof DecrementSkip
    source?: string
    variable: Variable | null
    end: ValueExpression | null
}

/**
 * @alpha
 */
export interface MenuChoice {
    option: TiString
    location: string
}

/**
 * @alpha
 */
export interface MenuStatement {
    type: typeof MenuStatement
    source?: string
    title: ValueExpression | null
    choices: MenuChoice[]
}

/**
 * @alpha
 */
export interface ProgramStatement {
    type: typeof ProgramStatement
    source?: string
    name: string
}

/**
 * @alpha
 */
export interface ReturnStatement {
    type: typeof ReturnStatement
    source?: string
}

/**
 * @alpha
 */
export interface StopStatement {
    type: typeof StopStatement
    source?: string
}

/**
 * @alpha
 */
export interface DelVarStatement {
    type: typeof DelVarStatement
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
export interface GraphStyleStatement {
    type: typeof GraphStyleStatement
    source?: string
    equation: ValueExpression | null
    style: ValueExpression | null
}

/**
 * @alpha
 */
export interface OpenLibStatement {
    type: typeof OpenLibStatement
    source?: string
    name: string
}

/**
 * @alpha
 */
export interface ExecLibStatement {
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
export interface Input {
    type: typeof Input
    source?: string
    text: ValueExpression | null
    variable: Variable | null
}

/**
 * @alpha
 */
export interface Prompt {
    type: typeof Prompt
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
export interface Display {
    type: typeof Display
    source?: string
    value: ValueExpression | null
}

/**
 * @alpha
 */
export interface DispGraph {
    type: typeof DispGraph
    source?: string
}

/**
 * @alpha
 */
export interface DispTable {
    type: typeof DispTable
    source?: string
}

/**
 * @alpha
 */
export interface Output {
    type: typeof Output
    source?: string
    row: ValueExpression | null
    column: ValueExpression | null
    value: ValueExpression | null
}

/**
 * @alpha
 */
export interface ClrHome {
    type: typeof ClrHome
    source?: string
}

/**
 * @alpha
 */
export interface ClrTable {
    type: typeof ClrTable
    source?: string
}

/**
 * @alpha
 */
export interface GetCalc {
    type: typeof GetCalc
    source?: string
    variable: Variable | null
    portflag: ValueExpression | null
}

/**
 * @alpha
 */
export interface Get {
    type: typeof Get
    source?: string
    variable: Variable | null
}

/**
 * @alpha
 */
export interface Send {
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
