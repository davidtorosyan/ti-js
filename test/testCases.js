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
            expected: `3`,
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
            expected: `2`,
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
            expected: `2`,
        },
        {
            name: "GotoSkip",
            input:`\
            Goto A
            Disp 1
            Lbl A
            Disp 2
            `,
            expected: `2`,
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
            expected: `1`,
        },
        {
            name: "Unary",
            input:`\
            Disp -1
            Disp --1
            `,
            expected: `\
            -1
            1
            `,
        },
        {
            name: "Multiplicative",
            input:`\
            Disp 2*3
            Disp 6/2
            `,
            expected: `\
            6
            3
            `,
        },
        {
            name: "Additive",
            input:`\
            Disp 2+4
            Disp 6-4
            `,
            expected: `\
            6
            2
            `,
        },
        {
            name: "Equality",
            input:`\
            Disp 2=2
            Disp 2=3
            Disp 2!=3
            Disp 2!=2
            `,
            expected: `\
            1
            0
            1
            0
            `,
        },
        {
            name: "Greater",
            input:`\
            Disp 2>1
            Disp 2>2
            Disp 2>3
            Disp 2>=1
            Disp 2>=2
            Disp 2>=3
            `,
            expected: `\
            1
            0
            0
            1
            1
            0
            `,
        },
        {
            name: "Less",
            input:`\
            Disp 2<1
            Disp 2<2
            Disp 2<3
            Disp 2<=1
            Disp 2<=2
            Disp 2<=3
            `,
            expected: `\
            0
            0
            1
            0
            1
            1
            `,
        },
        {
            name: "Parenthesis",
            input:`Disp (2)`,
            expected: `2`,
        },
        {
            name: "OrderOfOperations",
            input:`Disp -0+3*2-1`,
            expected: `5`,
        },
        {
            name: "OrderOfParenthesis",
            input:`Disp -(0+3)*(2-1)`,
            expected: `-3`,
        },
        {
            name: "RepeatFalse",
            input:`\
            Repeat 0
            Disp 1
            End
            `,
            expected: `1`,
        },
        {
            name: "RepeatOnce",
            input:`\
            1->X
            Repeat X=1
            Disp 1
            2->X
            End
            `,
            expected: `1`,
        },
        {
            name: "WhileFalse",
            input:`\
            While 0
            Disp 1
            End
            Disp 2
            `,
            expected: `2`,
        },
        {
            name: "WhileOnce",
            input:`\
            1->X
            While X=1
            Disp 1
            2->X
            End
            `,
            expected: `1`,
        },
        {
            name: "Increment",
            input:`\
            5->X
            IS>(X,6)
            Disp 1
            IS>(X,6)
            Disp 2
            Disp X
            `,
            expected: `\
            1
            7
            `,
        },
        {
            name: "Decrement",
            input:`\
            7->X
            DS<(X,6)
            Disp 1
            DS<(X,6)
            Disp 2
            Disp X
            `,
            expected: `\
            1
            5
            `,
        },
        {
            name: "Numeric",
            input:`\
            Disp 1
            Disp 1.0
            Disp 1.2
            Disp 1.2&E3
            Disp 0.1&E2
            Disp .1&E2
            Disp 1&E2
            Disp 1.&E2
            Disp 100&E-2
            `,
            expected: `\
            1
            1
            1.2
            1200
            10
            10
            100
            100
            1
            `,
        },
        {
            name: "Theta",
            input:`\
            1->&theta
            Disp &theta
            `,
            expected: `1`,
        },
        {
            name: "LeadingZero",
            input:`Disp .1`,
            expected: `.1`,
        },
        {
            name: "StringOperations",
            input:`\
            Disp "foo"
            Disp "foo"+"bar"
            Disp "foo"="bar"
            Disp "foo"!="bar"
            `,
            expected: `\
            foo
            foobar
            0
            1
            `,
        },
        {
            name: "StringNumberAdd",
            input:`Disp "foo"+1`,
            expected: `ERR:DATA TYPE`,
        },
        {
            name: "NestedFalseRepeat",
            input:`\
            If 0
            Then
            Repeat 0
            End
            Disp 1
            End
            Disp 2
            `,
            expected: `2`,
        },
        {
            name: "NestedFalseWhile",
            input:`\
            If 0
            Then
            While 0
            End
            Disp 1
            End
            Disp 2
            `,
            expected: `2`,
        },
    ]
};