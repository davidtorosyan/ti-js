(function () {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousLib = root.tipiler;

    // Create a safe reference to the tipiler object for use below.
    var tipiler = function (obj) {
        if (obj instanceof tipiler) return obj;
        if (!(this instanceof tipiler)) return new tipiler(obj);
        this.tipilerwrapped = obj;
    };

    // Export the tipiler object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `tipiler` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = tipiler;
        }
        exports.tipiler = tipiler;
    } else {
        root.tipiler = tipiler;
    }

    // Current version.
    tipiler.VERSION = '0.0.0';

    let grammar = `
    {
        var lib = "tilib.";

        var lib_runtime = lib + "runtime.";
        var lib_num = lib_runtime + "num";
        var lib_add = lib_runtime + "add";
        var lib_testEquals = lib_runtime + "testEquals";
        var lib_testLessEquals = lib_runtime + "testLessEquals";
        var lib_disp = lib_runtime + "disp";

        var mem = "mem.";
        var lib_vars = mem + "vars.";

        var startFunc = "() => { ";
        var endFunc = " }";
        var startFuncReturn = startFunc + "return ";

        function buildBinaryExpression(head, tail) 
        {
            return tail.reduce(
                (result, element) => element[0] + "(" + result + ", " + element[1] + ")",
                head);
        }

        function extractList(list, index) 
        {
            return list.map(function(element) { return element[index]; });
        }

        function buildList(head, tail, index) 
        {
            return [head].concat(extractList(tail, index));
        }

        function buildStringList(head, tail, index) 
        {
            return "[\\n" + buildList(head, tail, index).join(",\\n") + "\\n]";
        }

        function optionalList(value) 
        {
            return value !== null ? value : [];
        }
    }

    Start
        = Program

    LineTerminator
        = [\\n\\r\\u2028\\u2029]
    
    LineTerminatorSequence "end of line"
        = "\\n"
        / "\\r\\n"
        / "\\r"
        / "\\u2028"
        / "\\u2029"

    Variable
        = name:[A-Z]
        { return lib_vars + name }

    Integer
        = digits:[0-9]+ { return lib_num + "('" + digits.join("") + "')"; }

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

    Assignment
        = left:ValueExpression "->" right:Variable 
        { return startFunc + right + " = " + left + ";" + endFunc; }

    Display
        = "Disp " val:ValueExpression
        { return startFunc + lib_disp + "(" + val + ");" + endFunc; }

    IfStatement
        = "If " test:TestExpression 
        { return "{ type: 'IfStatement', condition: " + startFuncReturn + test + endFunc + "}" }

    ForLoop
        = "For(" variable:Variable "," start:ValueExpression "," end:ValueExpression "," step:ValueExpression ")"? 
        { return "{ type: 'ForLoop', " + 
            "init: " + startFunc + variable + " = " + start + ";" + endFunc + ", " +
            "condition: " + startFuncReturn + lib_testLessEquals + "(" + variable + ", " + end + ");" + endFunc + ", " + 
            "step: " + startFunc + variable + " = " + lib_add + "(" + variable + ", " + step + ");" + endFunc + 
            " }" }

    Location
        = [A-Z]

    Goto
        = "Goto " location:Location 
        { return "{ type: 'GotoStatement', label: '" + location  + "'}" }

    Label
        = "Lbl " location:Location
        { return "{ type: 'LabelStatement', label: '" + location  + "'}" }

    End
        = "End"
        { return "{ type: 'EndStatement' }" }

    Then
        = "Then"
        { return "{ type: 'ThenStatement' }" }

    Statement
        = Assignment
        / Goto
        / Label
        / End
        / Then
        / Display
        / ForLoop
        / IfStatement

    SourceElement
        = Statement

    SourceElements
        = head:SourceElement 
        tail:(LineTerminatorSequence SourceElement)* 
        { return buildStringList(head, tail, 1); }

    Program
        = SourceElements?
    `;

    parser = peg.generate(grammar);

    tipiler.parse = source => parser.parse(source);

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, tipiler registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party tipiler, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('tipiler', [], function () {
            return tipiler;
        });
    }
}.call(this));