$(() => {

    $source = $("#source");
    $transpiled = $("#transpiled");
    $output = $("#output");

    let appendToOutput = x => $output.val($output.val() + x + "\n");

    tilib.runtime.disp = appendToOutput;

    let transpile = () => {
        let source = $source.val();
        let transpiled = tipiler.parser.parse(source, { output: "source" })
        $transpiled.val(transpiled);

        $output.val("");
        let lines = eval(transpiled);
        try
        {
            tilib.core.run(lines, { source: source })
        }
        catch(error)
        {
            appendToOutput(error);
        }
    }

    $source.on("input selectionchange propertychange", transpile);

    $.get("loop.8xp.txt", (result) => {
        $source.val(result);
        transpile();
    })   
})