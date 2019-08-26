// TI-Basic Grammar
// ==================

{
    var lib         = "tilib.";
    var lib_runtime = lib + "runtime.";

    // runtime functions
    var lib_num            = lib_runtime + "num";
    var lib_add            = lib_runtime + "add";
    var lib_testEquals     = lib_runtime + "testEquals";
    var lib_testLessEquals = lib_runtime + "testLessEquals";
    var lib_disp           = lib_runtime + "disp";

    // memory
    var mem         = "mem";
    var mem_vars    = mem + ".vars.";

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
            throw "Property missing value: " + property;
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

Location
    = [A-Z]

Variable
    = name:[A-Z]
    { return mem_vars + name }

Integer
    = digits:[0-9]+ { return lib_num + paren(quote(digits.join(""))); }

// ----- Expressions -----

Factor
    = Integer
    / Variable

AdditiveOperator
    = "+" { return lib_add; }

AdditiveExpression
    = head:Factor 
    tail:(AdditiveOperator Factor)* 
    { return buildBinaryExpression(head, tail); }

TestOperator
    = "=" { return lib_testEquals; }

TestExpression
    = head:AdditiveExpression 
    tail:(TestOperator AdditiveExpression)* 
    { return buildBinaryExpression(head, tail); }

ValueExpression
    = TestExpression

// ----- Statements -----

Assignment
    = left:ValueExpression "->" right:Variable 
    { return buildType("Assignment", "statement", buildFunc(right + " = " + left)) };

Goto
    = "Goto " location:Location 
    { return buildType("GotoStatement", "label", quote(location)) };

Label
    = "Lbl " location:Location
    { return buildType("LabelStatement", "label", quote(location)) };

End
    = "End"
    { return buildType("EndStatement") };

Then
    = "Then"
    { return buildType("ThenStatement") };

Display
    = "Disp " val:ValueExpression
    { return buildType("IoStatement", "statement", buildFunc(lib_disp + paren(val))) };

ForLoop
    = "For(" variable:Variable "," start:ValueExpression "," end:ValueExpression "," step:ValueExpression ")"? 
    {   
        return buildType(
            "ForLoop", 
            "init",      buildFunc(variable + " = " + start),
            "condition", buildFunc(lib_testLessEquals + paren(variable, end), true),
            "step",      buildFunc(variable + " = " + lib_add + paren(variable, step))
        )
    };

IfStatement
    = "If " test:TestExpression 
    { return buildType("IfStatement", "condition", buildFunc(test, true)) };

Statement
    = Assignment
    / Goto
    / Label
    / End
    / Then
    / Display
    / ForLoop
    / IfStatement