// ----- Constants -----

let DEBUG_SETTING   = "debug";
let PERSIST_SETTING = "persist";
let SOURCE_SETTING  = "source";
let FREQUENCY_SETTING  = "frequency";

let DEFAULT_SETTINGS = {
    [DEBUG_SETTING]: false,
    [PERSIST_SETTING]: false,
    [FREQUENCY_SETTING]: 1,
}

// ----- On ready -----

$(() => 
{
    initInput();
    configureTranspiler();
});

function initInput() 
{
    bindCheckbox($("#debug"), DEBUG_SETTING);
    bindCheckbox($("#persist"), PERSIST_SETTING);
    bindNumber($("#frequency"), FREQUENCY_SETTING);

    bindTextarea(
        $("#source"), 
        SOURCE_SETTING, 
        () => getFromStorage(PERSIST_SETTING),
        callback => $.get("loop.8xp.txt", callback));
}

function configureTranspiler()
{
    let $source = $("#source");
    let $transpiled = $("#transpiled");
    let $output = $("#output");
    let $input = $("#input");
    let $daemonStatus = $("#daemonStatus");

    tilib.daemon.addEventListener("start", () => $daemonStatus.attr("data-status", "running"));
    tilib.daemon.addEventListener("suspend", () => $daemonStatus.attr("data-status", "suspended"));
    tilib.daemon.addEventListener("stop", () => $daemonStatus.removeAttr("data-status"));

    let io = tilib.io.val_io($output, { input: $input });

    let program = undefined;

    let transpile = () => {
        if (program !== undefined && program.isActive())
        {
            program.stop();
        }

        let source = $source.val();
        let transpiled = tipiler.parser.parse(source, { output: "source" })
        $transpiled.val(transpiled);

        $output.val("");
        let lines = eval(transpiled);
        program = tilib.core.run(lines, { 
            source: source, 
            debug: getFromStorage(DEBUG_SETTING), 
            io: io,
            frequencyMs: getFromStorage(FREQUENCY_SETTING) });
    };

    tipiler.parser.ready(() => 
    {
        $source.on("input selectionchange propertychange", transpile);
        $("#run").on("click", transpile);

        transpile();
    });
}

// ----- Helpers -----

function bindTextarea($textArea, name, condition = () => true, load = undefined)
{
    if (condition() === true)
    {
        $textArea.val(getFromStorage(name));
        $textArea.trigger("propertychange");
    }
    else if (load !== undefined)
    {
        load(result => 
        {
            $textArea.val(result);
            $textArea.trigger("propertychange");
        });
    }
    
    $textArea.on("input selectionchange propertychange", () => 
    {
        if (condition() === true)
        {
            saveToStorage(name, $textArea.val());
        }
    });
}

function bindCheckbox($checkBox, name)
{
    $checkBox.prop("checked", getFromStorage(name));
    $checkBox.on("change", () => saveToStorage(name, $checkBox.is(":checked")) );
}

function bindNumber($number, name)
{
    $number.prop("value", getFromStorage(name));
    $number.on("change", () => saveToStorage(name, parseFloat($number.val())) );
}

function getFromStorage(name) 
{
    let value = JSON.parse(localStorage.getItem(name));
    return value === null ? DEFAULT_SETTINGS[name] : value;
}

function saveToStorage(name, value) 
{
    localStorage.setItem(name, JSON.stringify(value));
}