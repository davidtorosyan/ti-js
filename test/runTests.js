// ----- On ready -----

$(() => 
{
    initTests();
    configureTranspiler();
});

function initTests() 
{
    let trimLastLine = (text) => 
    {
        let lastNewline = text.lastIndexOf("\n");
        if (lastNewline > 0) 
        {
            lastLine = text.substring(lastNewline);
            if (lastLine.trim().length === 0)
            {
                text = text.substring(0, lastNewline);
            }
        }
        return text;
    }

    let $tbody = $("<tbody>");
    $tbody.attr("data-type", "testCases");

    tiJsTests.testCases.forEach(testCase => 
    {
        let $row = $("<tr>");
        $row.attr("data-type", "testCase");

        let $input = $("<textarea>");
        $input.attr("data-type", "input");
        $input.val(trimLastLine(testCase.input));

        let $expected = $("<textarea>");
        $expected.attr("data-type", "expected");
        $expected.attr("readonly", true);
        $expected.val(trimLastLine(testCase.expected));

        let $output = $("<textarea>");
        $output.attr("data-type", "output");
        $output.attr("readonly", true);

        let $result = $("<span>");
        $result.attr("data-type", "result");

        $row.append($("<td>").append(document.createTextNode(testCase.name)));
        $row.append($("<td>").append($input));
        $row.append($("<td>").append($expected));
        $row.append($("<td>").append($output));
        $row.append($("<td>").append($result));

        $tbody.append($row)
    });

    $("#testTable").append($tbody);
}

function configureTranspiler()
{
    let $overall = $("#overall");
    let $failed = $("#failed");
    let $running = $("#running");

    let updateCount = () =>
    {
        let $testCases = $("[data-type=testCases]");
        let $allTests = $testCases.find("[data-type=result]");
        let $successTests = $allTests.filter("[data-result=success]");
        let $failedTests = $allTests.filter("[data-result=failure]");

        let allCount = $allTests.length;
        let successCount = $successTests.length;
        let failedCount = $failedTests.length;
        let runningCount = allCount - (successCount + failedCount);

        $overall.text(`${successCount}/${allCount}`);
        $failed.text(failedCount);
        $running.text(runningCount);

        $overall.toggleClass("success", successCount === allCount);
        $failed.toggleClass("failed", failed > 0);
        $running.toggleClass("running", runningCount > 0);
    };

    updateCount();

    let trimLastNewline = (text) => 
    {
        if (text.length > 0)
        {
            let lastCharacter = text[text.length-1];
            if (lastCharacter === "\n")
            {
                text = text.substring(0, text.length - 1);
            }
        }

        return text;
    };

    let transpile = ($input) => {

        if ($input.length === 0)
        {
            throw "Missing input!";
        }

        $testCase = $input.parents("[data-type=testCase]");
        $expected = $testCase.find("[data-type=expected]");
        $output = $testCase.find("[data-type=output]");
        $result = $testCase.find("[data-type=result]");

        let appendToOutput = x => $output.val($output.val() + x + "\n");
        tilib.runtime.disp = x => appendToOutput(x.value);

        $result.text("Transpiling");
        $result.removeAttr("data-result");

        let source = $input.val();
        let transpiled = tipiler.parser.parse(source, { output: "source" });

        $output.val("");
        let lines = eval(transpiled);

        $result.text("Running");

        try
        {
            tilib.core.run(lines, { source: source, debug: false })
        }
        catch(error)
        {
            appendToOutput(error);
        }

        let output = trimLastNewline($output.val());
        if (output === $expected.val())
        {
            $result.text("Success");
            $result.attr("data-result", "success");
        }
        else
        {
            $result.text("Failure");
            $result.attr("data-result", "failure");
        }

        updateCount();
    };

    tipiler.parser.ready(() => 
    {
        $("[data-type=testCases]").on("input selectionchange propertychange", "[data-type=input]", e => transpile($(e.currentTarget)));
        $("[data-type=testCases] [data-type=input]").each((i, input) => transpile($(input)));
    });
}