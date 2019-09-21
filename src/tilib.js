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
    tilib.daemon = () => {};

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

    // for daemon
    let messageName = "tiny-timeout-message";
    let exceptionName = "tiny-timeout-exception";
    let minimumDelay =  0.001; // 1 microsecond
    let tasks = {};
    let exceptions = [];
    let running = false;
    let nextTaskId = 0;
    let maxExceptions = 1000;

    let daemonEventTarget = document.createTextNode(null);

    let daemonEvent = (name) =>
    {
        let event = new Event(name);
        daemonEventTarget.dispatchEvent(event);
    };

    let daemonCreateTask = (func, delay, runOnce) =>
    {
        let taskId = nextTaskId++;

        tasks[taskId] = {
            func: func,
            delay: Math.max(delay, minimumDelay),
            lastRun: undefined,
            runOnce: runOnce,
            stopOnException: true,
        };

        if (running === false)
        {
            running = true;
            daemonEvent("start");
            window.postMessage(messageName, "*");
        }

        return taskId;
    };

    let daemonDeleteTask = taskId => 
    {
        delete tasks[taskId];
    };

    let daemonHandleMessage = event => 
    {
        if (!(event.source == window && event.data == messageName))
        {
            return;
        }

        event.stopPropagation();

        let time = performance.now();
        let taskIds = Object.keys(tasks);

        if (taskIds.length === 0)
        {
            running = false;
            daemonEvent("stop");
            return;
        }

        taskIds.forEach(taskId => 
        {
            let task = tasks[taskId];

            let runs = 0;
            if (task.lastRun === undefined || task.runOnce)
            {
                runs = 1;
            }
            else
            {
                let timeSinceRun = time - task.lastRun;
                runs = Math.floor(timeSinceRun / task.delay);
            }

            if (runs > 0)
            {
                task.lastRun = time;
            }

            for (let i = 0; i < runs; i++)
            {
                let result;

                try
                {
                    result = task.func();
                }
                catch (ex)
                {
                    result = tilib.daemon.FAULTED;

                    if (exceptions.length < maxExceptions)
                    {
                        exceptions.push(ex);
                        window.postMessage(exceptionName, "*");
                    }
                }

                if (result === tilib.daemon.DONE 
                    || task.runOnce
                    || (task.stopOnException && result === tilib.daemon.FAULTED))
                {
                    delete tasks[taskId];
                    break;
                }

                if (result === tilib.daemon.YIELD)
                {
                    break;
                }
            }
        });

        window.postMessage(messageName, "*");
    };

    let daemonHandleException = event => 
    {
        if (!(event.source == window && event.data == exceptionName))
        {
            return;
        }

        if (exceptions.length > 0)
        {
            throw exceptions.pop();
        }
    }

    window.addEventListener("message", daemonHandleMessage, true);
    window.addEventListener("message", daemonHandleException, true);

    // ----- daemon -----

    tilib.daemon.setTinyInterval = (func, delay) => daemonCreateTask(func, delay);
    tilib.daemon.clearTinyInterval = tinyIntervalID => daemonDeleteTask(tinyIntervalID);

    tilib.daemon.setTinyTimeout = (func, delay) => daemonCreateTask(func, delay, true);
    tilib.daemon.clearTinyTimeout = tinyTimeoutID => daemonDeleteTask(tinyTimeoutID);

    tilib.daemon.YIELD = "yield";
    tilib.daemon.DONE = "done";
    tilib.daemon.FAULTED = "faulted";

    tilib.daemon.addEventListener = daemonEventTarget.addEventListener.bind(daemonEventTarget);
    tilib.daemon.removeEventListener = daemonEventTarget.removeEventListener.bind(daemonEventTarget);
    tilib.daemon.dispatchEvent = daemonEventTarget.dispatchEvent.bind(daemonEventTarget);

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

    tilib.core.new_var = (name) => {
        let val = tilib.core.new_value(0);
        val.name = name;
        return val;
    };

    tilib.core.new_mem = () => (
        {
            vars: 
            {
                A: tilib.core.new_var("A"),
                B: tilib.core.new_var("B"),
                C: tilib.core.new_var("C"),
                D: tilib.core.new_var("D"),
                E: tilib.core.new_var("E"),
                F: tilib.core.new_var("F"),
                G: tilib.core.new_var("G"),
                H: tilib.core.new_var("H"),
                I: tilib.core.new_var("I"),
                J: tilib.core.new_var("J"),
                K: tilib.core.new_var("K"),
                L: tilib.core.new_var("L"),
                M: tilib.core.new_var("M"),
                N: tilib.core.new_var("N"),
                O: tilib.core.new_var("O"),
                P: tilib.core.new_var("P"),
                Q: tilib.core.new_var("Q"),
                R: tilib.core.new_var("R"),
                S: tilib.core.new_var("S"),
                T: tilib.core.new_var("T"),
                U: tilib.core.new_var("U"),
                V: tilib.core.new_var("V"),
                W: tilib.core.new_var("W"),
                X: tilib.core.new_var("X"),
                Y: tilib.core.new_var("Y"),
                Z: tilib.core.new_var("Z"),
                THETA: tilib.core.new_var("θ"),
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

        let io = tilib.io.default_io;
        if (options.io !== undefined)
        {
            io = options.io;
        }

        let frequencyMs = 1;
        if (options.frequencyMs !== undefined)
        {
            frequencyMs = options.frequencyMs;
        }

        let state = {
            bus: {
                mem: tilib.core.new_mem(),
                io: io,
            },

            debug: options.debug === true,
            sourceLines: sourceLines,

            searchLabel: undefined,
            ifResult: undefined,
            incrementDecrementResult: undefined,

            maximumLines: 50,
            linesRun: 0,

            blockStack: [],
            falsyStackHeight: undefined,
            falsyBlockPreviousIf: undefined,

            i: 0,
            lines: lines,

            callback: options.callback,
            frequencyMs: frequencyMs,

            status: "pending",
        };

        let taskId = tilib.daemon.setTinyInterval(() => tilib.core.runLoop(state), state.frequencyMs);

        return {
            getStatus: () => state.status,
            isActive: () => state.status === "pending" || state.status === "running",
            stop: () => tilib.daemon.clearTinyInterval(taskId)
        };
    }

    tilib.core.runLoop = (state) => 
    {
        let result;

        try
        {
            state.status = "running";
            result = tilib.core.runLine(state);
        }
        catch (ex)
        {
            state.status = "faulted";

            if (ex.type === undefined)
            {
                throw ex;
            }

            if (state.i < state.lines.length)
            {
                ex.source = {
                    index: state.i,
                    line: state.sourceLines === undefined ? undefined : state.sourceLines[state.i],
                };
            }

            tilib.io.error(state.bus.io, ex);
            result = tilib.daemon.DONE;
        }

        if (result === tilib.daemon.DONE)
        {
            if (state.status !== "faulted")
            {
                state.status = "done";
            }

            if (state.callback !== undefined)
            {
                state.callback();
            }
        }
        else
        {
            state.i += 1;
        }

        return result;
    }

    tilib.core.runLine = (state) => 
    {
        if (state.debug)
        {
            console.log(`Line: ${state.i}, \t\
searchLabel: ${state.searchLabel || ""}, \t\
ifResult: ${state.ifResult || ""}, \t\
blockStack: ${state.blockStack || ""} \t\
falsyStackHeight: ${state.falsyStackHeight || ""}, \t\
falsyBlockPreviousIf: ${state.falsyBlockPreviousIf || ""}, \t\
source: ${state.sourceLines[state.i] || ""}`);
        }

        if (state.i >= state.lines.length)
        {
            if (state.searchLabel !== undefined)
            {
                throw tilib.core.error("ti", "LABEL");
            }

            if (state.debug)
            {
                console.log(state.bus.mem);
            }

            return tilib.daemon.DONE;
        }

        state.linesRun++;

        if (state.linesRun >= state.maximumLines)
        {
            throw tilib.core.error("lib", "maxlines");
        }

        let line = state.lines[state.i];
        let type = line.type;

        // ----- scan for end -----

        if (state.falsyStackHeight !== undefined)
        {
            let lastBlockIndex = state.blockStack[state.blockStack.length-1];
            let lastBlock = state.lines[lastBlockIndex];
            
            if (type === "EndStatement" ||
            (type === "ElseStatement" && lastBlock.type === "ThenStatement"))
            {
                state.blockStack.pop();

                if (state.blockStack.length < state.falsyStackHeight)
                {
                    state.falsyStackHeight = undefined;
                }
            }
            
            if (type === "ForLoop" ||
            type === "RepeatLoop" ||
            type === "WhileLoop" ||
            (type === "ThenStatement" && state.falsyBlockPreviousIf === true) ||
            (type === "ElseStatement" && lastBlock.type === "ThenStatement"))
            {
                state.blockStack.push(state.i);
            }

            state.falsyBlockPreviousIf = type === "IfStatement";
            return;
        }

        state.falsyBlockPreviousIf = undefined;

        // ----- search for label -----

        if (state.searchLabel !== undefined)
        {
            if (type === "LabelStatement" && line.label == state.searchLabel)
            {
                state.searchLabel = undefined;
            }

            return;
        }

        // ----- check if result -----
        
        if (state.ifResult !== undefined)
        {
            let ifResultFalse = state.ifResult !== true;
            state.ifResult = undefined;

            if (type === "ThenStatement")
            {
                state.blockStack.push(state.i);

                if (ifResultFalse)
                {
                    state.falsyStackHeight = state.blockStack.length;
                }

                return;
            }

            if (ifResultFalse)
            {
                return;
            }
        }

        // ----- check incrementDecrementResult -----
        
        if (state.incrementDecrementResult !== undefined)
        {
            let incrementDecrementResultFalse = state.incrementDecrementResult !== true;
            state.incrementDecrementResult = undefined;

            if (incrementDecrementResultFalse)
            {
                return;
            }
        }

        // ----- normal execution -----

        switch (type)
        {
            // ----- CtlStatement -----
            case "IfStatement":
                state.ifResult = tilib.core.isTruthy(line.condition(state.bus));
                break;
            case "ThenStatement":
                throw tilib.core.error("ti", "SYNTAX");
            case "ElseStatement":
                if (state.blockStack.length === 0)
                {
                    throw tilib.core.error("ti", "SYNTAX");
                }
                if (state.lines[state.blockStack.pop()].type === "ThenStatement")
                {
                    state.blockStack.push(state.i);
                    state.falsyStackHeight = state.blockStack.length;
                }
                else 
                {
                    throw tilib.core.error("ti", "SYNTAX");
                }
                break;
            case "ForLoop":
                line.init(state.bus);
                state.blockStack.push(state.i);
                if (!tilib.core.isTruthy(line.condition(state.bus)))
                {
                    state.falsyStackHeight = state.blockStack.length;
                }
                break;
            case "WhileLoop":
                state.blockStack.push(state.i);
                if (!tilib.core.isTruthy(line.condition(state.bus)))
                {
                    state.falsyStackHeight = state.blockStack.length;
                }
                break;
            case "RepeatLoop":
                state.blockStack.push(state.i);
                break;
            case "EndStatement":
                if (state.blockStack.length === 0)
                {
                    throw tilib.core.error("ti", "SYNTAX");
                }
                let source = state.blockStack.pop();
                let sourceLine = state.lines[source];
                if (sourceLine.type === "ForLoop" ||
                    sourceLine.type === "WhileLoop" ||
                    sourceLine.type === "RepeatLoop")
                {
                    if (sourceLine.type === "ForLoop")
                    {
                        sourceLine.step(state.bus);
                    }

                    if (tilib.core.isTruthy(sourceLine.condition(state.bus)))
                    {
                        state.blockStack.push(source);
                        state.i = source;
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
                state.searchLabel = line.label;
                state.i = -1;
                break;
            // TODO increment and decrement have an interaction with DelVar
            case "IncrementSkip":
                line.increment(state.bus);
                state.incrementDecrementResult = tilib.core.isTruthy(line.condition(state.bus));
                break;
            case "DecrementSkip":
                line.decrement(state.bus);
                state.incrementDecrementResult = tilib.core.isTruthy(line.condition(state.bus));
                break;
            // ----- other -----
            case "Assignment":
                line.statement(state.bus);
                break;
            case "IoStatement":
                line.statement(state.bus);
                break;
            case "ValueStatement":
                state.bus.mem.ans = line.statement(state.bus);
                break;
            case "SyntaxError":
                throw tilib.core.error("ti", "SYNTAX");
            default:
                throw tilib.core.error("lib", "unexpected");
        }
    }

    // ----- runtime -----

    tilib.runtime.disp = (io, x) => {
        let str = x.value.toString();
        if (x.type === "numeric" && str.startsWith("0."))
        {
            str = str.substring(1);
        }
        io.stdout(str);
    };

    tilib.runtime.prompt = (io, x) => {
        io.stdout(`${x.name}=?`);
    };

    tilib.runtime.assign = (variable, value) => {
        if (variable.type === value.type)
        {
            variable.value = value.value;
        }
        else if (variable.type === "numeric")
        {
            // do nothing
        }
        else if (variable.type === "string")
        {
            throw tilib.core.error("ti", "DATA TYPE");
        }
        else
        {
            throw tilib.core.error("lib", "UnknownVariableType");
        }
    }

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

    tilib.io.error = (io, ex) => {
        if (ex.type === "ti")
        {
            io.stderr(`ERR:${ex.code}`, ex.source)
        }
        else if (ex.type == "lib")
        {
            io.liberr(`Error: ${ex.code}`, ex.source)
        }
    };

    tilib.io.default_io = {
        stdout: x => console.log(x),
        stderr: (x, source) => console.log(x),
        liberr: (x, source) => console.log(x),
    };

    tilib.io.val_io = (elem, options = {}) =>
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

        return {
            stdout: appendToOutput,
            stderr: includeErrors ? appendToError : tilib.io.default_io.stderr,
            liberr: includeLibErrors ? appendToError : tilib.io.default_io.stderr,
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