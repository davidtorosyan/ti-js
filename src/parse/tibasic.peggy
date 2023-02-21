// ti-basic grammar
// ================

{
  const types = require ('../common/types');
  const util = require ('./pegutil');
}

Start
  = Statement

// ----- Meta -----

tok_
  = '&{'

_tok
  = '}'

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
  / tok_'theta'_tok { return 'THETA' }

StringVariableIdentifier
  = tok_'Str' Digit _tok
  { return text(); }

ListVariableIdentifier
  = tok_'L' number:[1-6] _tok
  { return types.ListVariablePrefix + number; }

CustomListVariableIdentifier
  = tok_ prefix:'list' _tok Alpha AlphaNum? AlphaNum? AlphaNum? AlphaNum?
  { return types.ListVariablePrefix + text().substring(prefix.length + 3); } // TODO fix hack

NumericVariable
  = name:NumericVariableIdentifier { return { type: types.NumberVariable, name } }

StringVariable
  = name:StringVariableIdentifier { return { type: types.StringVariable, name } }

ListVariable
  = name:ListVariableIdentifier { return { type: types.ListVariable, name, custom: false } }
  / name:CustomListVariableIdentifier { return { type: types.ListVariable, name, custom: true } }

Variable
  = StringVariable
  / NumericVariable
  / ListVariable

ListIndex
  = list:ListVariable '(' index:ValueExpression OptionalEndParen 
  { return { type: types.ListIndex, list, index } }

Assignable
  = ListIndex
  / Variable 

// ----- Numbers -----

Integer
  = $(Digit+)

SignedInteger
  = $([+-]? Integer)

ExponentIndicator
  = tok_'E'_tok

ExponentPart
  = ExponentIndicator @$(SignedInteger)

NumericLiteral
  = integer:Integer '.' fraction:Integer? exponent:ExponentPart? { 
    return { type: types.TiNumber, integer, fraction, exponent }
  }
  / '.' fraction:Integer exponent:ExponentPart? { 
    return { type: types.TiNumber, fraction, exponent }
  }
  / integer:Integer exponent:ExponentPart? { 
    return { type: types.TiNumber, integer, exponent }
  }

// ----- Strings -----

Character
  = [^"]

CharacterString
  = $(Character*)

StringLiteral
  = '"' chars:CharacterString '"'? 
  { return { type: types.TiString, chars } }

// ----- Tokens -----

Answer
  = tok_'Ans'_tok
  { return { type: types.ANS } }

GetKey
  = tok_'getKey'_tok
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
  = tok_'-'_tok { return '-' }

TokenUnaryExpression
  = TokenExpression 
  / operator:UnaryOperator argument:TokenUnaryExpression
  { return { type: types.UnaryExpression, operator, argument } }

UnaryExpression
  = TokenUnaryExpression
  / NumericLiteral
  / operator:UnaryOperator argument:UnaryExpression
  { return { type: types.UnaryExpression, operator, argument } }

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
  / tok_'!='_tok { return '!=' }
  / tok_'>='_tok { return '>=' }
  / '>'
  / tok_'<='_tok { return '<=' }
  / '<' 

TestExpression
  = head:AdditiveExpression 
  tail:(TestOperator AdditiveExpression)* 
  { return util.buildBinaryExpression(head, tail); }

LogicalOperator
  = tok_' and '_tok { return ' and ' }
  / tok_' or '_tok { return ' or ' }
  / tok_' xor '_tok { return ' xor ' }

ValueExpression // should be LogicalExpression, but suppress proxy rule warning
  = head:TestExpression
  tail:(LogicalOperator TestExpression)* 
  { return util.buildBinaryExpression(head, tail); }

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
  = value:ValueExpression tok_'->'_tok assignable:Assignable 
  { return { type: types.AssignmentStatement, value, assignable }}

// ----- CTL -----
// TODO:
// * DelVar should be able to appear multiple times in a line
// * For( should accept expressions instead of a variable (with interesting behavior)

IfStatement
  = tok_'If '_tok value:ValueExpression? extra:ExtraCharacters?
  { return { type: types.IfStatement, value, extra }}

Then 
  = tok_'Then'_tok extra:ExtraCharacters?
  { return { type: types.ThenStatement, extra }}

Else 
  = tok_'Else'_tok extra:ExtraCharacters?
  { return { type: types.ElseStatement, extra }}

For
  = tok_'For('_tok variable:Variable? start:ArgumentExpression? end:ArgumentExpression? step:ArgumentExpression? args:ExtraArguments? OptionalEndParen extra:ExtraCharacters?
  { return { type: types.ForLoop, variable, start, end, step, args, extra }}

While
  = tok_'While '_tok value:ValueExpression? extra:ExtraCharacters?
  { return { type: types.WhileLoop, value, extra }}

Repeat
  = tok_'Repeat '_tok value:ValueExpression? extra:ExtraCharacters?
  { return { type: types.RepeatLoop, value, extra }}

End 
  = tok_'End'_tok extra:ExtraCharacters?
  { return { type: types.EndStatement, extra }}

Pause 
  = tok_'Pause'_tok 
  { return { type: types.PauseStatement }}

Label
  = tok_'Lbl '_tok location:Location
  { return { type: types.LabelStatement, location }}

Goto
  = tok_'Goto '_tok location:Location 
  { return { type: types.GotoStatement, location }}

IncrementSkip
  = tok_'IS>('_tok variable:Variable? end:ArgumentExpression? OptionalEndParen
  { return { type: types.IncrementSkip, variable, end }}

DecrementSkip
  = tok_'DS<('_tok variable:Variable? end:ArgumentExpression? OptionalEndParen
  { return { type: types.DecrementSkip, variable, end }}

Menu
  = tok_'Menu('_tok title:ValueExpression? options:(',' StringLiteral ',' Location)* OptionalEndParen
  { return util.buildMenuStatement(title, options); }

Program
  = tok_'prgm'_tok name:ProgramName
  { return { type: types.ProgramStatement, name }}

Return 
  = tok_'Return'_tok 
  { return { type: types.ReturnStatement }}

Stop 
  = tok_'Stop'_tok 
  { return { type: types.StopStatement }}

DelVar 
  = tok_'DelVar '_tok variable:Variable?
  { return { type: types.DelVarStatement, variable }}

GraphStyle 
  = tok_'GraphStyle('_tok equation:ValueExpression? style:ArgumentExpression? OptionalEndParen
  { return { type: types.GraphStyleStatement, equation, style }}

OpenLib 
  = tok_'OpenLib('_tok name:ProgramName OptionalEndParen
  { return { type: types.OpenLibStatement, name }}

ExecLib 
  = tok_'ExecLib('_tok name:ProgramName OptionalEndParen
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
  = tok_'Input '_tok text:PrefixArgumentExpression? variable:Variable?
  { return { type: types.Input, text, variable } }

Prompt
  = tok_'Prompt '_tok variable:Variable?
  { return { type: types.Prompt, variable } }

Display
  = tok_'Disp '_tok value:ValueExpression? 
  { return { type: types.Display, value } }

DispGraph
  = tok_'DispGraph'_tok
  { return { type: types.DispGraph } }

DispTable
  = tok_'DispTable'_tok
  { return { type: types.DispTable } }

Output
  = tok_'Output('_tok row:ValueExpression? column:ArgumentExpression? value:ArgumentExpression? OptionalEndParen
  { return { type: types.Output, row, column, value } }

ClrHome
  = tok_'ClrHome'_tok
  { return { type: types.ClrHome } }

ClrTable
  = tok_'ClrTable'_tok
  { return { type: types.ClrTable } }

GetCalc
  = tok_'GetCalc('_tok variable:Variable? portflag:ArgumentExpression? OptionalEndParen
  { return { type: types.GetCalc, variable, portflag } }

Get
  = tok_'Get('_tok  variable:Variable? OptionalEndParen
  { return { type: types.Get, variable } }

Send
  = tok_'Send('_tok variable:Variable? OptionalEndParen
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