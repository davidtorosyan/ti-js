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

    /**
     * ALL YOUR CODE IS BELONG HERE
     **/

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