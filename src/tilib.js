(function () {

    // Baseline setup
    // --------------

    // Establish the root object, `window` in the browser, or `exports` on the server.
    var root = this;

    // Save the previous value of the `_` variable.
    var previousLib = root.tilib;

    // Create a safe reference to the tilib object for use below.
    var tilib = function (obj) {
        if (obj instanceof tilib) return obj;
        if (!(this instanceof tilib)) return new tilib(obj);
        this.tilibwrapped = obj;
    };

    // Export the tilib object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we're in
    // the browser, add `tilib` as a global object.
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = tilib;
        }
        exports.tilib = tilib;
    } else {
        root.tilib = tilib;
    }

    // Current version.
    tilib.VERSION = '0.1.0';

    // ----- modules -----

    tilib.core = () => {};
    tilib.runtime = () => {};

    // ----- private -----

    let default_mem = undefined;

    let get_mem = () => 
    {
        if (default_mem === undefined)
        {
            default_mem = tilib.core.new_mem();
        }

        return default_mem;
    }

    // ----- core -----

    tilib.core.new_value = (num) => (
        {
            value: num | 0,
        }
    );

    tilib.core.new_var = () => tilib.core.new_value(0);

    tilib.core.new_mem = () => (
        {
            vars: 
            {
                X: tilib.core.new_var(),
                B: tilib.core.new_var(),
                Y: tilib.core.new_var(),
            },
            ans: tilib.core.new_var(),
            prgms: [],
        }
    );

    tilib.core.isTruthy = x => x.value !== 0;

    tilib.core.prgmNew = (name, program, source=[]) => 
    {
        get_mem().prgms.push(
        {
            name: name,
            program: program,
            source: source,
        });
    }

    tilib.core.prgmExec = name => 
    {
        let found = get_mem().prgms.find(e => e.name === name);

        if (found === undefined)
        {
            throw "ERR:UNDEFINED";
        }

        tilib.core.run(found.program, { source: found.source });
    }

    tilib.core.run = (lines, options = {}) => 
    {
        // ----- initialize environment -----

        let mem = tilib.core.new_mem();

        let debug = options.debug === true;

        let sourceLines = [];
        if (options.source !== undefined)
        {
            if (Array.isArray(options.source))
            {
                sourceLines = options.source;
            }
            else
            {
                sourceLines = options.source.split(/\r?\n/);
            }
        }

        let searchLabel = undefined;
        let ifResult = undefined;
        let incrementDecrementResult = undefined;

        let maximumLines = 50;
        let linesRun = 0;

        let blockStack = [];
        let falsyStackHeight = undefined;
        let falsyBlockPreviousIf = undefined;

        let addLineInfo = (message, i) =>
        {
            let result = message;

            if (i !== undefined)
            {
                result += ` on line ${i}`

                if (sourceLines.length > 0)
                {
                    result += `: ${sourceLines[i]}`
                }
            }

            return result;
        };

        let errorMessage = (type, i) =>
        {
            return addLineInfo(`ERR:${type}`, i);
        };

        let unimplemented = (type, i) =>
        {
            return addLineInfo(`Unimplemented type '${type}'`, i);
        };

        for (let i = 0; i < lines.length; i++) 
        {
            // ----- initialize line -----

            if (debug)
            {
                console.log(`Line: ${i}, \t\
searchLabel: ${searchLabel || ""}, \t\
ifResult: ${ifResult || ""}, \t\
blockStack: ${blockStack || ""} \t\
falsyStackHeight: ${falsyStackHeight || ""}, \t\
falsyBlockPreviousIf: ${falsyBlockPreviousIf || ""}, \t\
source: ${sourceLines[i] || ""}`);
            }

            linesRun++;

            if (linesRun >= maximumLines)
            {
                throw "Maximum lines hit!";
            }

            let line = lines[i];
            let type = line.type;

            // ----- scan for end -----

            if (falsyStackHeight !== undefined)
            {
                let lastBlockIndex = blockStack[blockStack.length-1];
                let lastBlock = lines[lastBlockIndex];
                
                if (type === "EndStatement" ||
                   (type === "ElseStatement" && lastBlock.type === "ThenStatement"))
                {
                    blockStack.pop();

                    if (blockStack.length < falsyStackHeight)
                    {
                        falsyStackHeight = undefined;
                    }
                }
                
                if (type === "ForLoop" ||
                   (type === "ThenStatement" && falsyBlockPreviousIf === true) ||
                   (type === "ElseStatement" && lastBlock.type === "ThenStatement"))
                {
                    blockStack.push(i);
                }

                falsyBlockPreviousIf = type === "IfStatement";
                continue;
            }

            falsyBlockPreviousIf = undefined;

            // ----- search for label -----

            if (searchLabel !== undefined)
            {
                if (type === "LabelStatement" && line.label == searchLabel)
                {
                    searchLabel = undefined;
                }

                continue;
            }

            // ----- check if result -----
            
            if (ifResult !== undefined)
            {
                let ifResultFalse = ifResult !== true;
                ifResult = undefined;

                if (type === "ThenStatement")
                {
                    blockStack.push(i);

                    if (ifResultFalse)
                    {
                        falsyStackHeight = blockStack.length;
                    }

                    continue;
                }

                if (ifResultFalse)
                {
                    continue;
                }
            }

             // ----- check incrementDecrementResult -----
            
             if (incrementDecrementResult !== undefined)
             {
                 let incrementDecrementResultFalse = incrementDecrementResult !== true;
                 incrementDecrementResult = undefined;

                 if (incrementDecrementResultFalse)
                 {
                     continue;
                 }
             }

            // ----- normal execution -----

            switch (type)
            {
                // ----- CtlStatement -----
                case "IfStatement":
                    ifResult = tilib.core.isTruthy(line.condition(mem));
                    break;
                case "ThenStatement":
                    throw errorMessage("SYNTAX", i);
                case "ElseStatement":
                    if (blockStack.length === 0)
                    {
                        throw errorMessage("SYNTAX", i);
                    }
                    if (lines[blockStack.pop()].type === "ThenStatement")
                    {
                        blockStack.push(i);
                        falsyStackHeight = blockStack.length;
                    }
                    else 
                    {
                        throw errorMessage("SYNTAX", i);
                    }
                    break;
                case "ForLoop":
                    line.init(mem);
                    blockStack.push(i);
                    if (!tilib.core.isTruthy(line.condition(mem)))
                    {
                        falsyStackHeight = blockStack.length;
                    }
                    break;
                case "WhileLoop":
                    blockStack.push(i);
                    if (!tilib.core.isTruthy(line.condition(mem)))
                    {
                        falsyStackHeight = blockStack.length;
                    }
                    break;
                case "RepeatLoop":
                    blockStack.push(i);
                    break;
                case "EndStatement":
                    if (blockStack.length === 0)
                    {
                        throw errorMessage("SYNTAX", i);
                    }
                    let source = blockStack.pop();
                    let sourceLine = lines[source];
                    if (sourceLine.type === "ForLoop" ||
                        sourceLine.type === "WhileLoop" ||
                        sourceLine.type === "RepeatLoop")
                    {
                        if (sourceLine.type === "ForLoop")
                        {
                            sourceLine.step(mem);
                        }

                        if (tilib.core.isTruthy(sourceLine.condition(mem)))
                        {
                            blockStack.push(source);
                            i = source;
                        }
                    }
                    else if (sourceLine.type === "ThenStatement" || 
                             sourceLine.type === "ElseStatement")
                    {
                        // empty
                    }
                    else 
                    {
                        throw addLineInfo(`Impossible end source '${sourceLine.type}'`, source);
                    }
                    break;
                case "PauseStatement":
                    throw unimplemented(type, i);
                case "LabelStatement":
                    break;
                case "GotoStatement":
                    searchLabel = line.label;
                    i = -1;
                    break;
                // TODO increment and decrement have an interaction with DelVar
                case "IncrementSkip":
                    line.increment(mem);
                    incrementDecrementResult = tilib.core.isTruthy(line.condition(mem));
                    break;
                case "DecrementSkip":
                    line.decrement(mem);
                    incrementDecrementResult = tilib.core.isTruthy(line.condition(mem));
                    break;
                // ----- other -----
                case "Assignment":
                    line.statement(mem);
                    break;
                case "IoStatement":
                    line.statement(mem);
                    break;
                case "ValueStatement":
                    mem.ans = line.statement(mem);
                    break;
                case "SyntaxError":
                    throw errorMessage("SYNTAX", i);
                default:
                    throw addLineInfo(`Unexpected type '${type}'`, i);
            }
        }

        // ----- flush -----

        if (searchLabel !== undefined)
        {
            throw errorMessage("LABEL");
        }

        if (debug)
        {
            console.log(mem);
        }
    }

    // ----- runtime -----

    tilib.runtime.assign = (variable, value) => variable.value = value.value;

    tilib.runtime.num = x => tilib.core.new_value(parseInt(x, 10));

    tilib.runtime.negative = x => tilib.core.new_value(-1 * x.value);

    tilib.runtime.multiply = (x, y) => tilib.core.new_value(x.value * y.value);
    tilib.runtime.divide   = (x, y) => tilib.core.new_value(x.value / y.value);

    tilib.runtime.add   = (x, y) => tilib.core.new_value(x.value + y.value);
    tilib.runtime.minus = (x, y) => tilib.core.new_value(x.value - y.value);

    tilib.runtime.disp = x => console.log(x);

    tilib.runtime.testEquals        = (x, y) => tilib.core.new_value(x.value === y.value);
    tilib.runtime.testNotEquals     = (x, y) => tilib.core.new_value(x.value !== y.value);
    tilib.runtime.testGreater       = (x, y) => tilib.core.new_value(x.value >   y.value);
    tilib.runtime.testGreaterEquals = (x, y) => tilib.core.new_value(x.value >=  y.value);
    tilib.runtime.testLess          = (x, y) => tilib.core.new_value(x.value <   y.value);
    tilib.runtime.testLessEquals    = (x, y) => tilib.core.new_value(x.value <=  y.value);

    // AMD registration happens at the end for compatibility with AMD loaders
    // that may not enforce next-turn semantics on modules. Even though general
    // practice for AMD registration is to be anonymous, tilib registers
    // as a named module because, like jQuery, it is a base library that is
    // popular enough to be bundled in a third party tilib, but not be part of
    // an AMD load request. Those cases could generate an error when an
    // anonymous define() is called outside of a loader request.
    if (typeof define === 'function' && define.amd) {
        define('tilib', [], function () {
            return tilib;
        });
    }
}.call(this));