// included in tilib

var tilib = () => {}

tilib.core = () => {}
tilib.runtime = () => {}

tilib.core.run = lines => 
{
    for (let i = 0; i < lines.length; i++) 
    {
        let ret = lines[i]();
        if (ret !== undefined)
        {
            i = ret - 1;
        }
    }
}

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

tilib.runtime.Disp = x => console.log(x);

// output of tipiler would be a file called loop.ti.js

var loop_ti_js = (mem = tilib.core.new_mem()) => 
{
    tilib.core.run([
        () => { mem.vars.X = 1; },
        () => { mem.vars.B = 1; },
        () => { mem.vars.Y = 1; },
        () =>
        { 
            if (mem.vars.Y > 2)
            {
                return 6;
            }
        },
        () => { mem.vars.X = mem.vars.X + 1; },
        () => 
        { 
            mem.vars.Y = mem.vars.Y + 1;
            return 3;
        },
        () => 
        { 
            if (!(mem.vars.B == 1))
            {
                return 9;
            }
        },
        () => { mem.vars.B = 2; },
        () => { return 4; },
        () => { tilib.runtime.Disp(mem.vars.X); },
    ]);
}

// calling the function

loop_ti_js();