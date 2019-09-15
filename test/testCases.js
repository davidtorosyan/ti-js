// ----- Test cases -----

let tiJsTests = 
{
    options:
    {
        indent: 12,
    },
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
        {
            name: "ForLoop",
            input:`\
            For(X,1,3,1)
            Disp X
            End
            `,
            expected: `\
            1
            2
            3
            `,
        },
        {
            name: "NestedForLoop",
            input:`\
            For(X,1,2,1)
            For(Y,1,2,1)
            Disp 1
            End
            End
            `,
            expected: `\
            1
            1
            1
            1
            `,
        },
        {
            name: "IfTrue",
            input:`\
            If 1
            Disp 1
            Disp 2
            `,
            expected: `\
            1
            2
            `,
        },
        {
            name: "IfFalse",
            input:`\
            If 0
            Disp 1
            Disp 2
            `,
            expected: `\
            2
            `,
        },
        {
            name: "IfThenTrue",
            input:`\
            If 1
            Then
            Disp 1
            Disp 2
            End
            Disp 3
            `,
            expected: `\
            1
            2
            3
            `,
        },
        {
            name: "IfThenFalse",
            input:`\
            If 0
            Then
            Disp 1
            Disp 2
            End
            Disp 3
            `,
            expected: `\
            3
            `,
        },
        {
            name: "IfTrueElse",
            input:`\
            If 1
            Then
            Disp 1
            Disp 2
            Else
            Disp 3
            Disp 4
            End
            Disp 5
            `,
            expected: `\
            1
            2
            5
            `,
        },
        {
            name: "IfFalseElse",
            input:`\
            If 0
            Then
            Disp 1
            Disp 2
            Else
            Disp 3
            Disp 4
            End
            Disp 5
            `,
            expected: `\
            3
            4
            5
            `,
        },
        {
            name: "NestedTrue",
            input:`\
            If 1
            Then
            If 1
            Then
            Disp 1
            End
            End
            Disp 2
            `,
            expected: `\
            1
            2
            `,
        },
        {
            name: "NestedFalse",
            input:`\
            If 0
            Then
            If 1
            Then
            Disp 1
            End
            End
            Disp 2
            `,
            expected: `\
            2
            `,
        },
        {
            name: "NestedFalseFor",
            input:`\
            If 0
            Then
            For(X,1,1,1
            Else
            End
            Disp 1
            End
            Disp 2
            `,
            expected: `\
            2
            `,
        },
        {
            name: "GotoSkip",
            input:`\
            Goto A
            Disp 1
            Lbl A
            Disp 2
            `,
            expected: `\
            2
            `,
        },
        {
            name: "GotoBlock",
            input:`\
            If 0
            Then
            Goto A
            End
            Lbl A
            Disp 1
            `,
            expected: `\
            1
            `,
        },
        {
            name: "Add",
            input:`\
            Disp 2+4
            `,
            expected: `\
            6
            `,
        },
        {
            name: "EqualsFalse",
            input:`\
            Disp 2=3
            `,
            expected: `\
            0
            `,
        },
        {
            name: "EqualsTrue",
            input:`\
            Disp 2=2
            `,
            expected: `\
            1
            `,
        },
    ]
};