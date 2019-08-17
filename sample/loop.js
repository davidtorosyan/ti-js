// included in tilib

var func_disp = x => console.log(x);

var lib_run = lines => 
{
    var i = 0;
    while (i < lines.length)
    {
        var ret = lines[i]();
        if (ret !== undefined)
        {
            i = ret;
        }
        else
        {
            i++;
        }
    }
}

// output of tipiler would be a file called loop.ti.js

var loop_ti_js = () => 
{
    var var_x =
    var_b =
    var_y =
    0

    return [
        () => { var_x = 1; },
        () => { var_b = 1; },
        () => { var_y = 1; },
        () =>
        { 
            if (var_y > 2)
            {
                return 6;
            }
        },
        () => { var_x = var_x + 1; },
        () => 
        { 
            var_y = var_y + 1;
            return 3;
        },
        () => 
        { 
            if (!(var_b == 1))
            {
                return 9;
            }
        },
        () => { var_b = 2; },
        () => { return 4; },
        () => { func_disp(var_x); },
    ]
}

// using the library

lib_run(loop_ti_js());