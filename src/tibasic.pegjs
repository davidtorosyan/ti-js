// TI-Basic Grammar
// ==================

{
    var lib         = "tilib.";
    var lib_runtime = lib + "runtime.";

    // runtime functions
    var lib_assign         = lib_runtime + "assign";
    var lib_num            = lib_runtime + "num";
    var lib_add            = lib_runtime + "add";
    var lib_minus          = lib_runtime + "minus";
    var lib_testEquals     = lib_runtime + "testEquals";
    var lib_testLessEquals = lib_runtime + "testLessEquals";
    var lib_disp           = lib_runtime + "disp";
    var lib_num_one        = lib_num + "('1')";

    // memory
    var mem         = "mem";
    var mem_vars    = mem + ".vars.";
    var mem_ans     = mem + ".ans";

    function quote(str)
    {
        return "'" + str + "'";
    }

    function paren(...args)
    {
        return "(" + args.join(", ") + ")";
    }

    function buildFunc(str, shouldReturn=false)
    {
        return "(" + mem + ") => { " + (shouldReturn ? "return " : "") + str + " }";
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

    function buildBinaryExpression(head, tail) 
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

Variable
    = name:[A-Z]
    { return mem_vars + name; }

Integer
    = digits:[0-9]+ 
    { return lib_num + paren(quote(digits.join(""))); }

StringLiteral
    = '"' chars:[^"]* '"'? 
    { return quote(chars.join("")); }

Answer
    = "Ans"
    { return mem_ans; }

OptionalEndParen
    = ")"?

// ----- Expressions -----
// TODO:
// * Finish Additive and Test
// * Unary
// * Multiplication

Factor
    = Integer
    / Answer
    / Variable
    / StringLiteral

AdditiveOperator
    = "+" 
    { return lib_add; }

AdditiveExpression
    = head:Factor 
    tail:(AdditiveOperator Factor)* 
    { return buildBinaryExpression(head, tail); }

TestOperator
    = "=" 
    { return lib_testEquals; }

TestExpression
    = head:AdditiveExpression 
    tail:(TestOperator AdditiveExpression)* 
    { return buildBinaryExpression(head, tail); }

ValueExpression
    = TestExpression

// ----- Statements -----

ValueStatement
    = value:ValueExpression
    { return buildType("ValueStatement", "statement", buildFunc(value, true)) };

Assignment
    = left:ValueExpression "->" right:Variable 
    { return buildType("Assignment", "statement", buildFunc(lib_assign + paren(right, left))) };

// ----- CTL -----
// TODO:
// * Everything after Menu
// * Arguments should always be optional (and result in argument error)

IfStatement
    = "If " condition:ValueExpression 
    { return buildType("IfStatement", "condition", buildFunc(condition, true)) };

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
    = "DS>(" variable:Variable "," end:ValueExpression OptionalEndParen
    { 
        return buildType(
            "DecrementSkip", 
            "decrement", buildFunc(lib_assign + paren(variable, lib_minus + paren(variable, lib_num_one))),
            "condition", buildFunc(lib_testLessEquals + paren(variable, end), true),
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

Display
    = "Disp " val:ValueExpression
    { return buildType("IoStatement", "statement", buildFunc(lib_disp + paren(val))) };

// ----- Statement -----
// TODO:
// * More statement types

Statement
    = Assignment
    / CtlStatement
    / Display
    / ValueStatement