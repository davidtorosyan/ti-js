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
    tipiler.VERSION = '0.1.0';

    // ----- modules -----

    tipiler.parser = () => {};
    tipiler.fetcher = () => {};

    // ----- private -----

    let grammar = undefined;
    let parser = undefined;

    let downloadGrammar = (callback) =>
    {
        tipiler.fetcher.download("../src/tibasic.pegjs", (result) => 
        {
            grammar = result;
            callback();
        });
    }

    function quote(str)
    {
        return "'" + str + "'";
    }

    let buildList = (lines) => 
    {
        return "[\n  " + lines.join(",\n  ") + "\n]";
    }

    // ----- fetcher -----

    tipiler.fetcher.download = (url, callback) => 
    {
        let request = new XMLHttpRequest();
        request.open("GET", url, true);
    
        request.onload = () =>  
        {
            if (request.status >= 200 && request.status < 400) 
            {
                callback(request.response);
            } 
            else 
            {
                throw "Failed to download: " + request.statusText
            }
        };
    
        request.onerror = () =>
        {
            throw "Failed to download."
        };
    
        request.send();
    };

    // ----- parser -----

    tipiler.parser.ready = (callback) => 
    {
        if (grammar === undefined)
        {
            downloadGrammar(callback);
        }
        else
        {
            callback();
        }    
    }

    tipiler.parser.parse = (source, options = {}) => 
    {
        // ----- initialize -----

        if (parser === undefined)
        {
            if (grammar === undefined)
            {
                throw "Error: tipiler not ready"
            }

            parser = peg.generate(grammar);
        }

        let outputAsProgram = false;
        switch (options.output)
        {
            case "program":
            case undefined:
                outputAsProgram = true;
                break;
            case "source":
                break;
            default:
                throw `Unrecognized option for output: ${options.output}`;
        }

        let name = options.name;
        let includeSource = options.includeSource;

        if (includeSource !== undefined && name === undefined)
        {
            throw "Cannot include source without specifying name"
        }

        // ----- parse -----

        let sourceLines = source.split(/\r?\n/);
        let parsedLines = sourceLines.map(s => 
        {
            try 
            {
                    return parser.parse(s);
            }
            catch (error)
            {
                if (error.name === "SyntaxError")
                {
                    return "{ type: 'SyntaxError' }";
                }

                throw error;
            }
        })

        let lines = buildList(parsedLines);

        if (name !== undefined)
        {
            lines = `tilib.core.prgmNew('${name}', ${lines}`;

            if (includeSource)
            {
                lines += `, ${buildList(sourceLines.map(s => quote(s)))}`;
            }

            lines += ")";
        }

        if (outputAsProgram)
        {
            lines = eval(lines);
        }

        return lines;
    }

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
