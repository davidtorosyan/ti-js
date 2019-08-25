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
    tilib.VERSION = '0.0.0';

    tilib.core = () => {};
    tilib.runtime = () => {};

    tilib.core.new_mem = () => (
        {
            vars: 
            {
                X: 0,
                B: 0,
                Y: 0,
            },
        }
    );

    tilib.core.isTruthy = x => !!x;

    tilib.core.run = (lines, options = {}) => 
    {
        mem = tilib.core.new_mem();

        let searchLabel = undefined;
        let ifResult = undefined;
        let scanForEndBalance = undefined;

        let maximumLines = 50;
        let linesRun = 0;

        let stack = [];

        for (let i = 0; i < lines.length; i++) 
        {
            if (options.debug === true)
            {
                console.log(`Executing line: ${i}, \t\
searchLabel: ${searchLabel}, \t\
ifResult: ${ifResult}, \t\
scanForEndBalance: ${scanForEndBalance}, \t\
stack: ${stack}`);
            }

            linesRun++;

            if (linesRun >= maximumLines)
            {
                throw "Maximum lines hit!";
            }

            let line = lines[i];
            let type = line.type;

            if (scanForEndBalance !== undefined)
            {
                switch (type)
                {
                    case "ForLoop":
                    case "ThenStatement":
                        scanForEndBalance++;
                        break;
                    case "EndStatement":
                        scanForEndBalance--;
                        break;
                    case "IfStatement":
                    case "GotoStatement":
                    case "LabelStatement":
                    case undefined:
                        break;
                    default:
                        throw `Unknown type on line ${i}`;
                }

                if (scanForEndBalance === 0)
                {
                    scanForEndBalance = undefined;
                }

                continue;
            }

            if (searchLabel !== undefined)
            {
                if (type === "LabelStatement" && line.label == searchLabel)
                {
                    searchLabel = undefined;
                }

                continue;
            }

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

            switch (type)
            {
                case "IfStatement":
                    ifResult = tilib.core.isTruthy(line.condition());
                    break;
                case "GotoStatement":
                    searchLabel = line.label;
                    i = -1;
                    break;
                case "LabelStatement":
                    break;
                case "EndStatement":
                    if (stack.length === 0)
                    {
                        throw `ERR:SYNTAX on line ${i}`
                    }
                    let source = stack.pop();
                    let sourceLine = lines[source];
                    switch (sourceLine.type)
                    {
                        case "ForLoop":
                            sourceLine.step();
                            if (sourceLine.condition())
                            {
                                stack.push(source);
                                i = source;
                            }
                            break;
                        case "ThenStatement":
                            break;
                        case "EndStatement":
                        case "IfStatement":
                        case "GotoStatement":
                        case "LabelStatement":
                        case undefined:
                            throw `Impossible end source on line ${i}`;    
                        default:
                            throw `Unknown type on line ${i}`;    
                    }
                    break;
                case "ThenStatement":
                    throw `ERR:SYNTAX on line ${i}`
                case "ForLoop":
                    line.init();
                    if (tilib.core.isTruthy(line.condition()))
                    {
                        stack.push(i);
                    }
                    else
                    {
                        scanForEndBalance = 1;
                    }
                    break;
                case undefined:
                    line();
                    break;
                default:
                    throw `Unknown type on line ${i}`;
            }
        }
    }

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