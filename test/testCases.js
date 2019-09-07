// ----- Test cases -----

let tiJsTests = 
{
    testCases: 
    [
        {
            name: "Display",
            input: "Disp 1",
            expected: "1",
        },
        {
            name: "Store",
            input:`\
2->X
Disp X
            `,
            expected: "2",
        },
        {
            name: "MultipleDisplay",
            input:`\
Disp 1
Disp 2
            `,
            expected: `\
1
2
            `,
        },
    ]
};