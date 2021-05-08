// ti-basic grammar
// ================

{
  const types = require ('../common/types');
  const util = require ('./pegutil');
}

Start
  = Statement

// ----- Components -----
// TODO:
// * List assignments (e.g dim)
// * Constants (e.g i, e, pi)
// * Angles
// * Matrices

// ----- Basic characters -----

SourceCharacter
  = .

Alpha
  = [A-Z]

AlphaNum
  = [A-Z0-9]

Digit
  = [0-9]

// ----- Useful character sets -----

ExtraCharacters
  = SourceCharacter+ { return true }

OptionalEndParen
  = ')'?

// ----- Names -----

Location
  = AlphaNum AlphaNum?
  { return text(); }

ProgramName
  = Alpha AlphaNum? AlphaNum? AlphaNum? AlphaNum? AlphaNum? AlphaNum? AlphaNum?
  { return text(); }

// ----- Variables -----

NumericVariableIdentifier
  = Alpha
  / '&theta' { return 'THETA' }

StringVariableIdentifier
  = 'Str' Digit
  { return text(); }

ListVariableIdentifier
  = '&L' number:[1-6]
  { return 'List' + number; }

CustomListVariableIdentifier
  = '&list' Alpha AlphaNum? AlphaNum? AlphaNum? AlphaNum?
  { return 'List' + text().substring(5); }

NumericVariable
  = name:NumericVariableIdentifier { return { type: types.VARIABLE, name } }

StringVariable
  = name:StringVariableIdentifier { return { type: types.STRINGVARIABLE, name } }

ListVariable
  = name:ListVariableIdentifier { return { type: types.LISTVARIABLE, name, custom: false } }
  / name:CustomListVariableIdentifier { return { type: types.LISTVARIABLE, name, custom: true } }

Variable
  = StringVariable
  / NumericVariable
  / ListVariable

ListIndex
  = list:ListVariable "(" index:ValueExpression OptionalEndParen 
  { return { type: types.LISTINDEX, list, index } }

Assignable
  = ListIndex
  / Variable 

// ----- Numbers -----

Integer
  = $(Digit+)

SignedInteger
  = $([+-]? Integer)

ExponentIndicator
  = '&E'

ExponentPart
  = ExponentIndicator @$(SignedInteger)

NumericLiteral
  = integer:Integer '.' fraction:Integer? exponent:ExponentPart? { 
    return { type: types.NUMBER, integer, fraction, exponent }
  }
  / '.' fraction:Integer exponent:ExponentPart? { 
    return { type: types.NUMBER, fraction, exponent }
  }
  / integer:Integer exponent:ExponentPart? { 
    return { type: types.NUMBER, integer, exponent }
  }

// ----- Strings -----

Character
  = [^"]

CharacterString
  = $(Character*)

StringLiteral
  = '"' chars:CharacterString '"'? 
  { return { type: types.STRING, chars } }

// ----- Tokens -----

Answer
  = 'Ans'
  { return { type: types.ANS } }

GetKey
  = 'getKey'
  { return { type: types.GetKey } }

Token
  = Answer
  / GetKey

// Numeric is not included as a "token",
// because they are not distinct and so
// cannot be used in implicit multiplication.
TokenLiteral
  = Token
  / Assignable
  / StringLiteral

// ----- Expressions -----
// TODO:
// * Logic
// * Exponents
// * Trig
// * Other variable types (e.g. equations)
// * List expressions (e.g. seq)
// * Math (e.g. abs)
// * Complex Math (e.g. conj)
// * Probability (e.g. rand)
// * Matrices

ListExpression
 = '{' head:ValueExpression tail:ArgumentExpression* '}'?
 { return util.buildList(head, tail); }

TokenExpression
  = TokenLiteral
  / '(' @ValueExpression ')'
  / ListExpression

UnaryOperator
  = '&-'

TokenUnaryExpression
  = TokenExpression 
  / operator:UnaryOperator argument:TokenUnaryExpression
  { return { type: types.UNARY, operator, argument } }

UnaryExpression
  = TokenUnaryExpression
  / NumericLiteral
  / operator:UnaryOperator argument:UnaryExpression
  { return { type: types.UNARY, operator, argument } }

// See note on TokenLiteral
ImplicitMultiplicativeExpression
  = head:TokenUnaryExpression tail:(UnaryExpression TokenUnaryExpression)* end:UnaryExpression?
  { return util.buildImplicitBinaryExpression(head, tail, end); }
  / head:UnaryExpression tail:(TokenUnaryExpression UnaryExpression)* end:TokenUnaryExpression?
  { return util.buildImplicitBinaryExpression(head, tail, end); }
  / UnaryExpression

MultiplicativeOperator
  = '*'
  / '/'

MultiplicativeExpression
  = head:ImplicitMultiplicativeExpression 
  tail:(MultiplicativeOperator ImplicitMultiplicativeExpression)* 
  { return util.buildBinaryExpression(head, tail); }

AdditiveOperator
  = '+'
  / '-'

AdditiveExpression
  = head:MultiplicativeExpression 
  tail:(AdditiveOperator MultiplicativeExpression)* 
  { return util.buildBinaryExpression(head, tail); }

TestOperator
  = '='
  / '!='
  / '>='
  / '>'
  / '<='
  / '<' 

TestExpression
  = head:AdditiveExpression 
  tail:(TestOperator AdditiveExpression)* 
  { return util.buildBinaryExpression(head, tail); }

LogicalOperator
  = 'and' 
  / 'or'

LogicalExpression
  = head:TestExpression
  tail:( _ LogicalOperator _ TestExpression)* 
  { return util.buildLogicalExpression(head, tail); }

ValueExpression
  = LogicalExpression


ArgumentExpression
  = ',' @ValueExpression

PrefixArgumentExpression
  = @ValueExpression ','

ExtraArguments
  = ArgumentExpression+ { return true }



// ----- Statements -----

EmptyStatement
  = !SourceCharacter
  { return { type: types.EmptyStatement } }

ValueStatement
  = value:ValueExpression
  { return { type: types.ValueStatement, value }}

Assignment
  = value:ValueExpression '->' assignable:Assignable 
  { return { type: types.AssignmentStatement, value, assignable }}

// ----- CTL -----
// TODO:
// * DelVar should be able to appear multiple times in a line
// * For( should accept expressions instead of a variable (with interesting behavior)

IfStatement
  = 'If ' value:ValueExpression? extra:ExtraCharacters?
  { return { type: types.IfStatement, value, extra }}

Then 
  = 'Then' extra:ExtraCharacters?
  { return { type: types.ThenStatement, extra }}

Else 
  = 'Else' extra:ExtraCharacters?
  { return { type: types.ElseStatement, extra }}

For
  = 'For(' variable:Variable? start:ArgumentExpression? end:ArgumentExpression? step:ArgumentExpression? args:ExtraArguments? OptionalEndParen extra:ExtraCharacters?
  { return { type: types.ForLoop, variable, start, end, step, args, extra }}

While
  = 'While ' value:ValueExpression? extra:ExtraCharacters?
  { return { type: types.WhileLoop, value, extra }}

Repeat
  = 'Repeat ' value:ValueExpression? extra:ExtraCharacters?
  { return { type: types.RepeatLoop, value, extra }}

End 
  = 'End' extra:ExtraCharacters?
  { return { type: types.EndStatement, extra }}

Pause 
  = 'Pause' 
  { return { type: types.PauseStatement }}

Label
  = 'Lbl ' location:Location
  { return { type: types.LabelStatement, location }}

Goto
  = 'Goto ' location:Location 
  { return { type: types.GotoStatement, location }}

IncrementSkip
  = 'IS>(' variable:Variable? end:ArgumentExpression? OptionalEndParen
  { return { type: types.IncrementSkip, variable, end }}

DecrementSkip
  = 'DS<(' variable:Variable? end:ArgumentExpression? OptionalEndParen
  { return { type: types.DecrementSkip, variable, end }}

Menu
  = 'Menu(' title:ValueExpression? options:(',' StringLiteral ',' Location)* OptionalEndParen
  { return util.buildMenuStatement(title, options); }

Program
  = 'prgm' name:ProgramName
  { return { type: types.ProgramStatement, name }}

Return 
  = 'Return' 
  { return { type: types.ReturnStatement }}

Stop 
  = 'Stop' 
  { return { type: types.StopStatement }}

DelVar 
  = 'DelVar ' variable:Variable?
  { return { type: types.DelVarStatement, variable }}

GraphStyle 
  = 'GraphStyle(' equation:ValueExpression? style:ArgumentExpression? OptionalEndParen
  { return { type: types.GraphStyleStatement, equation, style }}

OpenLib 
  = 'OpenLib(' name:ProgramName OptionalEndParen
  { return { type: types.OpenLibStatement, name }}

ExecLib 
  = 'ExecLib(' name:ProgramName OptionalEndParen
  { return { type: types.ExecLibStatement, name }}

CtlStatement
  = IfStatement
  / Then
  / Else
  / For
  / While
  / Repeat
  / End
  / Pause
  / Label
  / Goto
  / IncrementSkip
  / DecrementSkip
  / Menu
  / Program
  / Return
  / Stop
  / DelVar
  / GraphStyle
  / OpenLib
  / ExecLib

// ----- I/O -----
// TODO:
// * Allow multiple variables for Prompt
// * Remaining commands

Input
  = 'Input ' text:PrefixArgumentExpression? variable:Variable?
  { return { type: types.Input, text, variable } }

Prompt
  = 'Prompt ' variable:Variable?
  { return { type: types.Prompt, variable } }

Display
  = 'Disp ' value:ValueExpression? 
  { return { type: types.Display, value } }

DispGraph
  = 'DispGraph'
  { return { type: types.DispGraph } }

DispTable
  = 'DispTable'
  { return { type: types.DispTable } }

Output
  = 'Output(' row:ValueExpression? column:ArgumentExpression? value:ArgumentExpression? OptionalEndParen
  { return { type: types.Output, row, column, value } }

ClrHome
  = 'ClrHome'
  { return { type: types.ClrHome } }

ClrTable
  = 'ClrTable'
  { return { type: types.ClrTable } }

GetCalc
  = 'GetCalc(' variable:Variable? portflag:ArgumentExpression? OptionalEndParen
  { return { type: types.GetCalc, variable, portflag } }

Get
  = 'Get('  variable:Variable? OptionalEndParen
  { return { type: types.Get, variable } }

Send
  = 'Send(' variable:Variable? OptionalEndParen
  { return { type: types.Send, variable } }

IoStatement
  = Input
  / Prompt
  / Display
  / DispGraph
  / DispTable
  / Output
  / ClrHome
  / ClrTable
  / GetCalc
  / Get
  / Send

// ----- Statement -----
// TODO:
// * List statements (e.g. SortA)
// * Draw statements (e.g. Line)
// * Point statements (e.g. Pxl-On)
// * Store statements (e.g. StorePic)

Statement
  = EmptyStatement
  / Assignment
  / CtlStatement
  / IoStatement
  / ValueStatement
  
  _ "whitespace"
  = [ \t\n\r]*