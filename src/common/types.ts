// types
// =====

/* eslint-disable no-use-before-define */

// ----- Errors -----

/**
 * @alpha
 */
export const TiSyntaxError = 'TiSyntaxError'

/**
 * @alpha
 */
export interface TiSyntaxError {
    type: typeof TiSyntaxError
    source?: string
}

// ----- Number -----

/**
 * @alpha
 */
export const TiNumber = 'TiNumber'

/**
 * @alpha
 */
export interface NumberLiteral {
    type: typeof TiNumber
    resolved: false
    integer?: number
    fraction?: number | null
    exponent?: number | null
}

/**
 * @alpha
 */
export interface NumberResolved {
    type: typeof TiNumber
    resolved: true
    float: number
}

/**
 * @alpha
 */
export type TiNumber =
    NumberLiteral
    | NumberResolved

// ----- String -----

/**
 * @alpha
 */
export const TiString = 'TiString'

/**
 * @alpha
 */
export interface TiString {
    type: typeof TiString
    chars: string
}

// ----- List -----

/**
 * @alpha
 */
export const ListVariablePrefix = 'List'

/**
 * @alpha
 */
export const TiList = 'TiList'

/**
 * @alpha
 */
export interface ListLiteral {
    type: typeof TiList
    resolved: false
    elements: ValueExpression[]
}

/**
 * @alpha
 */
export interface ListResolved {
    type: typeof TiList
    resolved: true
    elements: NumberResolved[]
}

/**
 * @alpha
 */
export type TiList =
    ListLiteral
    | ListResolved

// ----- ValueResolved -----

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
export const ANS = 'ANS'

/**
 * @alpha
 */
export interface Ans {
    type: typeof ANS
}

/**
 * @alpha
 */
export const GetKey = 'GetKey'

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
export const NumberVariable = 'NumberVariable'

/**
 * @alpha
 */
export interface NumberVariable {
    type: typeof NumberVariable
    name: string
}

/**
 * @alpha
 */
export const StringVariable = 'StringVariable'

/**
 * @alpha
 */
export interface StringVariable {
    type: typeof StringVariable
    name: string
}

/**
 * @alpha
 */
export const ListVariable = 'ListVariable'

/**
 * @alpha
 */
export interface ListVariable {
    type: typeof ListVariable
    name: string
    custom: boolean
}

/**
 * @alpha
 */
export const ListIndex = 'ListIndex'

/**
 * @alpha
 */
export interface ListIndex {
    type: typeof ListIndex
    list: ListVariable
    index: ValueExpression
}

/**
 * @alpha
 */
export type Variable =
    NumberVariable
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
export const BinaryExpression = 'BinaryExpression'

/**
 * @alpha
 */
export interface BinaryExpression {
    type: typeof BinaryExpression
    operator: string
    left: ValueExpression
    right: ValueExpression
}

/**
 * @alpha
 */
export const UnaryExpression = 'UnaryExpression'

/**
 * @alpha
 */
export interface UnaryExpression {
    type: typeof UnaryExpression
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
    | TiSyntaxError
    | Ans
    | GetKey

// ----- Statements -----

/**
 * @alpha
 */
export const EmptyStatement = 'EmptyStatement'

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
export const ValueStatement = 'ValueStatement'

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
export const AssignmentStatement = 'AssignmentStatement'

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
export interface IfStatement {
    type: typeof IfStatement
    source?: string
    value: ValueExpression | null
    extra: boolean | null
}

/**
 * @alpha
 */
export const ThenStatement = 'ThenStatement'

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
export const ElseStatement = 'ElseStatement'

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
export const ForLoop = 'ForLoop'

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
export const WhileLoop = 'WhileLoop'

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
export const RepeatLoop = 'RepeatLoop'

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
export const EndStatement = 'EndStatement'

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
export const PauseStatement = 'PauseStatement'

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
export const LabelStatement = 'LabelStatement'

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
export const GotoStatement = 'GotoStatement'

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
export const IncrementSkip = 'IncrementSkip'

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
export const DecrementSkip = 'DecrementSkip'

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
export const MenuStatement = 'MenuStatement'

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
export const ProgramStatement = 'ProgramStatement'

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
export const ReturnStatement = 'ReturnStatement'

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
export const StopStatement = 'StopStatement'

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
export const DelVarStatement = 'DelVarStatement'

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
export const GraphStyleStatement = 'GraphStyleStatement'

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
export const OpenLibStatement = 'OpenLibStatement'

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
export const ExecLibStatement = 'ExecLibStatement'

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
export interface Input {
    type: typeof Input
    source?: string
    text: ValueExpression | null
    variable: Variable | null
}

/**
 * @alpha
 */
export const Prompt = 'Prompt'

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
export const Display = 'Display'

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
export const DispGraph = 'DispGraph'

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
export const DispTable = 'DispTable'

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
export const Output = 'Output'

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
export const ClrHome = 'ClrHome'

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
export const ClrTable = 'ClrTable'

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
export const GetCalc = 'GetCalc'

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
export const Get = 'Get'

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
export const Send = 'Send'

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
    | TiSyntaxError
    | AssignmentStatement
    | CtlStatement
    | IoStatement
    | ValueStatement
