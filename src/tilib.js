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

    tilib.core.new_mem = () => (
        {
            vars: 
            {
                X: 0,
                B: 0,
                Y: 0,
            },
            prgms: [],
        }
    );

    tilib.core.isTruthy = x => !!x;

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
        let scanForEndBalance = undefined;

        let maximumLines = 50;
        let linesRun = 0;

        let stack = [];

        let errorMessage = (type, i) =>
        {
            return `ERR:${type} on line ${i}: ${sourceLines[i] || ""}`
        };

        for (let i = 0; i < lines.length; i++) 
        {
            // ----- initialize line -----

            if (debug)
            {
                console.log(`Line: ${i}, \t\
searchLabel: ${searchLabel || ""}, \t\
ifResult: ${ifResult || ""}, \t\
scanForEndBalance: ${scanForEndBalance || ""}, \t\
stack: ${stack || ""} \t\
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

            if (scanForEndBalance !== undefined)
            {
                if (type === "ForLoop" || type === "ThenStatement")
                {
                    scanForEndBalance++;
                }
                else if (type === "EndStatement")
                {
                    scanForEndBalance--;
                }

                if (scanForEndBalance === 0)
                {
                    scanForEndBalance = undefined;
                }

                continue;
            }

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
                if (ifResult === true)
                {
                    ifResult = undefined;
                    if (type === "ThenStatement")
                    {
                        stack.push(i);
                        continue;
                    }
                }
                else
                {
                    ifResult = undefined;
                    if (type === "ThenStatement")
                    {
                        scanForEndBalance = 1;
                    }
                    
                    continue;
                }
            }

            // ----- normal execution -----

            switch (type)
            {
                case "IfStatement":
                    ifResult = tilib.core.isTruthy(line.condition(mem));
                    break;
                case "GotoStatement":
                    searchLabel = line.label;
                    i = -1;
                    break;
                case "LabelStatement":
                case "NO-OP":
                    break;
                case "EndStatement":
                    if (stack.length === 0)
                    {
                        throw errorMessage("SYNTAX", i);
                    }
                    let source = stack.pop();
                    let sourceLine = lines[source];
                    if (sourceLine.type === "ForLoop")
                    {
                        sourceLine.step(mem);
                        if (sourceLine.condition(mem))
                        {
                            stack.push(source);
                            i = source;
                        }
                    }
                    else if (sourceLine.type === "ThenStatement")
                    {
                        // empty
                    }
                    else 
                    {
                        throw `Impossible end source on line ${i}`;    
                    }
                    break;
                case "ThenStatement":
                    throw errorMessage("SYNTAX", i);
                case "ForLoop":
                    line.init(mem);
                    if (tilib.core.isTruthy(line.condition(mem)))
                    {
                        stack.push(i);
                    }
                    else
                    {
                        scanForEndBalance = 1;
                    }
                    break;
                case "SyntaxError":
                    throw errorMessage("SYNTAX", i);
                case "Assignment":
                case "IoStatement":
                    line.statement(mem);
                    break;
                default:
                    throw `Unknown type on line ${i}`;
            }
        }
    }

    // ----- runtime -----

    tilib.runtime.num = x => parseInt(x, 10);
    tilib.runtime.add = (x, y) => x + y;
    tilib.runtime.disp = console.log;
    tilib.runtime.testEquals = (x, y) => x === y;
    tilib.runtime.testLessEquals = (x, y) => x <= y;

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
