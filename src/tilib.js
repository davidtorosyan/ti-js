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
    tilib.io = () => {};

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

    tilib.core.error = (type, code) => (
        {
            type: type,
            code: code,
        }
    );

    tilib.core.new_value = (num, type="numeric") => (
        {
            type: type,
            value: num,
        }
    );

    tilib.core.new_var = () => tilib.core.new_value(0);

    tilib.core.new_mem = () => (
        {
            vars: 
            {
                A: tilib.core.new_var(),
                B: tilib.core.new_var(),
                C: tilib.core.new_var(),
                D: tilib.core.new_var(),
                E: tilib.core.new_var(),
                F: tilib.core.new_var(),
                G: tilib.core.new_var(),
                H: tilib.core.new_var(),
                I: tilib.core.new_var(),
                J: tilib.core.new_var(),
                K: tilib.core.new_var(),
                L: tilib.core.new_var(),
                M: tilib.core.new_var(),
                N: tilib.core.new_var(),
                O: tilib.core.new_var(),
                P: tilib.core.new_var(),
                Q: tilib.core.new_var(),
                R: tilib.core.new_var(),
                S: tilib.core.new_var(),
                T: tilib.core.new_var(),
                U: tilib.core.new_var(),
                V: tilib.core.new_var(),
                W: tilib.core.new_var(),
                X: tilib.core.new_var(),
                Y: tilib.core.new_var(),
                Z: tilib.core.new_var(),
                THETA: tilib.core.new_var(),
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
            tilib.core.error("UNDEFINED");
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

        for (let i = 0; i < lines.length; i++) 
        {
            try
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
                    throw tilib.core.error("lib", "maxlines");
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
                    type === "RepeatLoop" ||
                    type === "WhileLoop" ||
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
                        throw tilib.core.error("ti", "SYNTAX");
                    case "ElseStatement":
                        if (blockStack.length === 0)
                        {
                            throw tilib.core.error("ti", "SYNTAX");
                        }
                        if (lines[blockStack.pop()].type === "ThenStatement")
                        {
                            blockStack.push(i);
                            falsyStackHeight = blockStack.length;
                        }
                        else 
                        {
                            throw tilib.core.error("ti", "SYNTAX");
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
                            throw tilib.core.error("ti", "SYNTAX");
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
                            throw tilib.core.error("lib", `impossibleEndFrom'${sourceLine.type}`);
                        }
                        break;
                    case "PauseStatement":
                        throw tilib.core.error("lib", "unimplemented");
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
                        throw tilib.core.error("ti", "SYNTAX");
                    default:
                        throw tilib.core.error("lib", "unexpected");
                }
            }
            catch (ex)
            {
                ex.source = {
                    index: i,
                    line: sourceLines === undefined ? undefined : sourceLines[i]
                };

                tilib.io.error(ex);
                return;
            }
        }

        // ----- flush -----

        if (searchLabel !== undefined)
        {
            throw tilib.core.error("ti", "LABEL");
        }

        if (debug)
        {
            console.log(mem);
        }
    }

    // ----- runtime -----

    tilib.runtime.disp = x => {
        let str = x.value.toString();
        if (x.type === "numeric" && str.startsWith("0."))
        {
            str = str.substring(1);
        }
        tilib.io.stdout(str);
    };

    tilib.runtime.assign = (variable, value) => variable.value = value.value;

    tilib.runtime.num = (integer, fraction, exponent) => {
        let str = "";
        if (integer !== undefined)
        {
            str += integer;
        }
        if (fraction !== undefined)
        {
            str += "." + fraction;
        }
        if (exponent !== undefined)
        {
            str += "e" + exponent;
        }
        return tilib.core.new_value(parseFloat(str));
    };

    tilib.runtime.str = x => { return tilib.core.new_value(x, "string"); }

    let unaryOperation = (operation, supportedTypes=["numeric"]) => 
        (x) => 
        {
            if (!supportedTypes.includes(x.type)) 
                throw tilib.core.error("ti", "DATA TYPE");
            return tilib.core.new_value(operation(x.value), x.type)
        };

    tilib.runtime.negative = unaryOperation(x => -1 * x);

    let binaryOperation = (operation, supportedTypes=["numeric"]) => 
        (x, y) => 
        {
            if (x.type !== y.type || !supportedTypes.includes(x.type)) 
                throw tilib.core.error("ti", "DATA TYPE");
            return tilib.core.new_value(operation(x.value, y.value), x.type)
        };

    tilib.runtime.multiply = binaryOperation((x, y) => x * y)
    tilib.runtime.divide   = binaryOperation((x, y) => x / y)
    tilib.runtime.add      = binaryOperation((x, y) => x + y, ["numeric", "string"])
    tilib.runtime.minus    = binaryOperation((x, y) => x - y)

    let testOperation = (operation, supportedTypes=["numeric"]) => 
        binaryOperation((x, y) => operation(x, y) ? 1 : 0, supportedTypes);

    tilib.runtime.testEquals        = testOperation((x, y) => x === y, ["numeric", "string"]);
    tilib.runtime.testNotEquals     = testOperation((x, y) => x !== y, ["numeric", "string"]);
    tilib.runtime.testGreater       = testOperation((x, y) => x >   y);
    tilib.runtime.testGreaterEquals = testOperation((x, y) => x >=  y);
    tilib.runtime.testLess          = testOperation((x, y) => x <   y);
    tilib.runtime.testLessEquals    = testOperation((x, y) => x <=  y);

    // ----- io -----

    tilib.io.error = ex => {
        if (ex.type === "ti")
        {
            tilib.io.stderr(`ERR:${ex.code}`, ex.source)
        }
        else if (ex.type == "lib")
        {
            tilib.io.liberr(`Error: ${ex.code}`, ex.source)
        }
    };

    tilib.io.reset = () =>
    {
        tilib.io.stdout = x => console.log(x);
        tilib.io.stderr = (x, source) => console.log(x);
        tilib.io.liberr = (x, source) => console.log(x);
    };
    tilib.io.reset();

    tilib.io.updateVal = (elem, options = {}) =>
    {
        let parseOption = (option, defaultValue) =>
        {
            return option === undefined ? defaultValue : option === true;
        };

        let includeErrors = parseOption(options.includeErrors, true);
        let includeLineNumbers = parseOption(options.includeLineNumbers, true);
        let includeSource = parseOption(options.includeSource, true);
        let includeLibErrors = parseOption(options.includeLibErrors, true);

        let appendToOutput = x => elem.val(elem.val() + x + "\n");
        let appendToError = (x, source) => {
            let result = x;
            if (source !== undefined)
            {
                if (source.index !== undefined && includeLineNumbers)
                {
                    result += ` on line ${source.index}`;
                }

                if (source.line !== undefined && includeSource)
                {
                    result += ` :${source.line}`;
                }
            }
            appendToOutput(result);
        };

        tilib.io.stdout = appendToOutput;
        if (includeErrors)
        {
            tilib.io.stderr = appendToError;
        }
        if (includeLibErrors)
        {
            tilib.io.liberr = appendToError;
        }
    };

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