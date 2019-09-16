// ----- Constants -----

let DEBUG_SETTING   = "debug";
let PERSIST_SETTING = "persist";
let SOURCE_SETTING  = "source";

let DEFAULT_SETTINGS = {
    [DEBUG_SETTING]: false,
    [PERSIST_SETTING]: false,
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
    let $debug = $("#debug");

    let appendToOutput = x => $output.val($output.val() + x + "\n");

    tilib.io.output = appendToOutput;

    let transpile = () => {
        let source = $source.val();
        let transpiled = tipiler.parser.parse(source, { output: "source" })
        $transpiled.val(transpiled);

        $output.val("");
        let lines = eval(transpiled);
        try
        {
            tilib.core.run(lines, { source: source, debug: getFromStorage(DEBUG_SETTING) })
        }
        catch(error)
        {
            appendToOutput(error);
        }
    };

    tipiler.parser.ready(() => 
    {
        $source.on("input selectionchange propertychange", transpile);
        $debug.on("change", transpile);
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

function getFromStorage(name) 
{
    let value = JSON.parse(localStorage.getItem(name));
    return value === null ? DEFAULT_SETTINGS[name] : value;
}

function saveToStorage(name, value) 
{
    localStorage.setItem(name, JSON.stringify(value));
}