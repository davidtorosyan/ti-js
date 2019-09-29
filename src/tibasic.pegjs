// TI-Basic Grammar
// ==================

{
    const types = require ('./types.js');
    const util = require ('./pegutil.js');

    var lib         = "ti.";
    var lib_runtime = lib + "runtime.";

    // runtime functions
    var lib_assign            = lib_runtime + "assign";
    var lib_num               = lib_runtime + "num";
    var lib_str               = lib_runtime + "str";
    
    var lib_negative          = lib_runtime + "negative";
    var lib_multiply          = lib_runtime + "multiply";
    var lib_divide            = lib_runtime + "divide";
    var lib_add               = lib_runtime + "add";
    var lib_minus             = lib_runtime + "minus";
    var lib_testEquals        = lib_runtime + "testEquals";
    var lib_testNotEquals     = lib_runtime + "testNotEquals";
    var lib_testGreater       = lib_runtime + "testGreater";
    var lib_testGreaterEquals = lib_runtime + "testGreaterEquals";
    var lib_testLess          = lib_runtime + "testLess";
    var lib_testLessEquals    = lib_runtime + "testLessEquals";

    var lib_prompt            = lib_runtime + "prompt";
    var lib_disp              = lib_runtime + "disp";

    var lib_num_one           = lib_num + "('1')";

    // bus
    var bus         = "bus";
    var mem         = bus + ".mem";
    var mem_vars    = mem + ".vars.";
    var mem_ans     = mem + ".ans";
    var io          = bus + ".io";
    var ctl         = bus + ".ctl";

    function quote(str)
    {
        if (str === undefined || str === null)
        {
            return "''";
        }
        else if (Array.isArray(str))
        {
            return "'" + str.join("") + "'";
        }
        else
        {
            return "'" + str + "'";
        }
    }

    function paren(...args)
    {
        return "(" + args.join(", ") + ")";
    }

    function buildFunc(str, shouldReturn=false)
    {
        return "(" + bus + ") => { " + (shouldReturn ? "return " : "") + str + " }";
    }

    function buildType(name, ...args)
    {
        let result = "{ type: '" + name + "'";

        let property = undefined;
        for (let i = 0; i < args.length; i++)
        {
            if (property === undefined)
            {
                property = args[i];
            }
            else
            {
                result += ", " + property + ": " + args[i];
                property = undefined;
            }
        }

        if (property !== undefined)
        {
            throw "TI-Basic grammar exception: Property missing value: " + property;
        }

        result += " }";

        return result;
    }

    function buildBinaryExpressionOld(head, tail) 
    {
        return tail.reduce(
            (result, element) => element[0] + paren(result, element[1]),
            head);
    }
}

Start
    = Statement

// ----- Components -----
// TODO:
// * Lists

Location
  = [A-Z0-9][A-Z0-9]?
  { return text(); }

VariableIdentifier
  = [A-Z]
  / "&theta" { return "THETA" }

Variable
  = name:VariableIdentifier { return { type: types.VARIABLE, name } }

NumericLiteral
  = integer:Integer "." fraction:Integer? exponent:ExponentPart? { 
    return { type: types.NUMBER, integer, fraction, exponent }
  }
  / "." fraction:Integer exponent:ExponentPart? { 
    return { type: types.NUMBER, fraction, exponent }
  }
  / integer:Integer exponent:ExponentPart? { 
    return { type: types.NUMBER, integer, exponent }
  }

Digit
  = [0-9]

ExponentPart
  = ExponentIndicator @$(SignedInteger)

ExponentIndicator
  = "&E"

Integer
  = $(Digit+)

SignedInteger
  = $([+-]? Integer)

Character
  = [^"]

CharacterString
  = $(Character*)

StringLiteral
  = '"' chars:CharacterString '"'? 
  { return { type: types.STRING, chars } }

Answer
  = "Ans"
  { return { type: types.ANS } }

OptionalEndParen
  = ")"?

Literal
  = NumericLiteral
  / Answer
  / Variable
  / StringLiteral

// ----- Expressions -----

PrimaryExpression
  = Literal
  / "(" @ValueExpression ")"

UnaryOperator
  = "-"

UnaryExpression
  = PrimaryExpression 
  / operator:UnaryOperator argument:UnaryExpression
  { return { type: types.UNARY, operator, argument } }

MultiplicativeOperator
  = "*"
  / "/"

MultiplicativeExpression
  = head:UnaryExpression 
  tail:(MultiplicativeOperator UnaryExpression)* 
  { return util.buildBinaryExpression(head, tail); }

AdditiveOperator
  = "+"
  / "-"

AdditiveExpression
  = head:MultiplicativeExpression 
  tail:(AdditiveOperator MultiplicativeExpression)* 
  { return util.buildBinaryExpression(head, tail); }

TestOperator
  = "="
  / "!="
  / ">="
  / ">"
  / "<="
  / "<" 

TestExpression
  = head:AdditiveExpression 
  tail:(TestOperator AdditiveExpression)* 
  { return util.buildBinaryExpression(head, tail); }

ValueExpression
  = TestExpression

// ----- Statements -----

ValueStatement
  = value:ValueExpression
  { return { type: types.ValueStatement, value }}

Assignment
  = value:ValueExpression "->" variable:Variable 
  { return { type: types.AssignmentStatement, value, variable }}

// ----- CTL -----
// TODO:
// * Everything after Menu
// * Arguments should always be optional (and result in argument error)

IfStatement
  = "If " value:ValueExpression 
  { return { type: types.IfStatement, value }}

Then 
    = "Then" 
    { return buildType("ThenStatement") };

Else 
    = "Else" 
    { return buildType("ElseStatement") };

For
    = "For(" variable:Variable "," start:ValueExpression "," end:ValueExpression "," step:ValueExpression OptionalEndParen 
    {   
        return buildType(
            "ForLoop", 
            "init",      buildFunc(lib_assign + paren(variable, start)),
            "condition", buildFunc(lib_testLessEquals + paren(variable, end), true),
            "step",      buildFunc(lib_assign + paren(variable, lib_add + paren(variable, step)))
        )
    };

While
    = "While " condition:ValueExpression
    { return buildType("WhileLoop", "condition", buildFunc(condition, true)) };

Repeat
    = "Repeat " condition:ValueExpression
    { return buildType("RepeatLoop", "condition", buildFunc(condition, true)) };

End 
    = "End" 
    { return buildType("EndStatement") };

Pause 
    = "Pause" 
    { return buildType("PauseStatement") };

Label
    = "Lbl " location:Location
    { return buildType("LabelStatement", "label", quote(location)) };

Goto
    = "Goto " location:Location 
    { return buildType("GotoStatement", "label", quote(location)) };

IncrementSkip
    = "IS>(" variable:Variable "," end:ValueExpression OptionalEndParen
    { 
        return buildType(
            "IncrementSkip", 
            "increment", buildFunc(lib_assign + paren(variable, lib_add + paren(variable, lib_num_one))),
            "condition", buildFunc(lib_testLessEquals + paren(variable, end), true),
        )
    };

DecrementSkip
    = "DS<(" variable:Variable "," end:ValueExpression OptionalEndParen
    { 
        return buildType(
            "DecrementSkip", 
            "decrement", buildFunc(lib_assign + paren(variable, lib_minus + paren(variable, lib_num_one))),
            "condition", buildFunc(lib_testGreaterEquals + paren(variable, end), true),
        )
    };

// Menu("Title","Option 1",Label 1[,…,"Option 7",Label 7])
Menu
    = "Menu(" 
    { return buildType("MenuStatement") };

Program
    = "prgm" 
    { return buildType("ProgramStatement") };

Return 
    = "Return" 
    { return buildType("ReturnStatement") };

Stop 
    = "Stop" 
    { return buildType("StopStatement") };

DelVar 
    = "DelVar" 
    { return buildType("DelVarStatement") };

GraphStyle 
    = "GraphStyle(" 
    { return buildType("GraphStyleStatement") };

OpenLib 
    = "OpenLib(" 
    { return buildType("OpenLibStatement") };

ExecLib 
    = "ExecLib(" 
    { return buildType("ExecLibStatement") };

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
// * Input

Prompt
    = "Prompt " variable:Variable
    { return buildType("IoStatement", "statement", buildFunc(lib_prompt + paren(io, ctl, variable)), "action", quote("suspend")) };

Display
    = "Disp " value:ValueExpression 
    { return { type: types.Display, value } }

IoStatement
    // = Input
    = Prompt
    / Display
    // / DispGraph
    // / DispTable
    // / Output(
    // / getKey
    // / ClrHome
    // / ClrTable
    // / GetCalc(
    // / Get(
    // / Send(

// ----- Statement -----
// TODO:
// * More statement types

Statement
    = Assignment
    / CtlStatement
    / IoStatement
    / ValueStatement