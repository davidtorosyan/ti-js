// ----- Test cases -----

// eslint-disable-next-line no-unused-vars
const tiJsTests =
{
  options: {
    indent: 8,
  },
  testCases: [
    {
      name: 'Display',
      input: 'Disp 1',
      expected: '1',
    },
    {
      name: 'Store',
      input: ['2->X', 'Disp X'],
      expected: '2',
    },
    {
      name: 'MultipleDisplay',
      input: ['Disp 1', 'Disp 2'],
      expected: ['1', '2'],
    },
    {
      name: 'DispScroll',
      input: ['Disp 1', 'Disp 2', 'Disp 3', 'Disp 4', 'Disp 5', 'Disp 6', 'Disp 7', 'Disp 8', 'Disp 9'],
      expected: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
    },
    {
      name: 'ForLoop',
      input: ['For(X,1,3,1)', 'Disp X', 'End'],
      expected: ['1', '2', '3'],
    },
    {
      name: 'NestedForLoop',
      input: ['For(X,1,2,1)', 'For(Y,1,2,1)', 'Disp 1', 'End', 'End'],
      expected: ['1', '1', '1', '1'],
    },
    {
      name: 'IfTrue',
      input: ['If 1', 'Disp 1', 'Disp 2'],
      expected: ['1', '2'],
    },
    {
      name: 'IfFalse',
      input: ['If 0', 'Disp 1', 'Disp 2'],
      expected: ['2'],
    },
    {
      name: 'IfThenTrue',
      input: ['If 1', 'Then', 'Disp 1', 'Disp 2', 'End', 'Disp 3'],
      expected: ['1', '2', '3'],
    },
    {
      name: 'IfThenFalse',
      input: ['If 0', 'Then', 'Disp 1', 'Disp 2', 'End', 'Disp 3'],
      expected: '3',
    },
    {
      name: 'IfTrueElse',
      input: ['If 1', 'Then', 'Disp 1', 'Disp 2', 'Else', 'Disp 3', 'Disp 4', 'End', 'Disp 5'],
      expected: ['1', '2', '5'],
    },
    {
      name: 'IfFalseElse',
      input: ['If 0', 'Then', 'Disp 1', 'Disp 2', 'Else', 'Disp 3', 'Disp 4', 'End', 'Disp 5'],
      expected: ['3', '4', '5'],
    },
    {
      name: 'NestedTrue',
      input: ['If 1', 'Then', 'If 1', 'Then', 'Disp 1', 'End', 'End', 'Disp 2'],
      expected: ['1', '2'],
    },
    {
      name: 'NestedFalse',
      input: ['If 0', 'Then', 'If 1', 'Then', 'Disp 1', 'End', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'NestedFalseFor',
      input: ['If 0', 'Then', 'For(X,1,1,1', 'Else', 'End', 'Disp 1', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'GotoSkip',
      input: ['Goto A', 'Disp 1', 'Lbl A', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'GotoBlock',
      input: ['If 0', 'Then', 'Goto A', 'End', 'Lbl A', 'Disp 1'],
      expected: '1',
    },
    {
      name: 'GotoError',
      input: 'Goto A',
      expected: 'ERR:LABEL',
    },
    {
      name: 'Unary',
      input: ['Disp &{-}1', 'Disp &{-}&{-}1'],
      expected: ['-1', '1'],
    },
    {
      name: 'Multiplicative',
      input: ['Disp 2*3', 'Disp 6/2'],
      expected: ['6', '3'],
    },
    {
      name: 'Additive',
      input: ['Disp 2+4', 'Disp 6-4'],
      expected: ['6', '2'],
    },
    {
      name: 'Equality',
      input: ['Disp 2=2', 'Disp 2=3', 'Disp 2!=3', 'Disp 2!=2'],
      expected: ['1', '0', '1', '0'],
    },
    {
      name: 'Greater',
      input: ['Disp 2>1', 'Disp 2>2', 'Disp 2>3', 'Disp 2>=1', 'Disp 2>=2', 'Disp 2>=3'],
      expected: ['1', '0', '0', '1', '1', '0'],
    },
    {
      name: 'Less',
      input: ['Disp 2<1', 'Disp 2<2', 'Disp 2<3', 'Disp 2<=1', 'Disp 2<=2', 'Disp 2<=3'],
      expected: ['0', '0', '1', '0', '1', '1'],
    },
    {
      name: 'And',
      input: ['Disp 1 and 1', 'Disp 1 and 0', 'Disp 0 and 0', 'Disp 1-1 and 1', 'Disp 1*0 and 1', 'Disp 1 and 1+2', 'Disp 1=1 and 2<3'],
      expected: ['1', '0', '0', '0', '0', '1', '1'],
    },
    {
      name: 'Or',
      input: ['Disp 1 or 1', 'Disp 1 or 0', 'Disp 0 or 0', 'Disp 1-1 or 1', 'Disp 1*0 or 1', 'Disp 1 or 1+2', 'Disp 1<0 or 2>3'],
      expected: ['1', '1', '0', '1', '1', '1', '0'],
    },
    {
      name: 'Xor',
      input: ['Disp 1 xor 1', 'Disp 1 xor 0', 'Disp 0 xor 0', 'Disp 1-1 xor 1', 'Disp 1*0 xor 1', 'Disp 1 xor 1+2', 'Disp 1<0 xor 2>3'],
      expected: ['0', '1', '0', '1', '1', '0', '0'],
    },
    {
      name: 'Parenthesis',
      input: 'Disp (2)',
      expected: '2',
    },
    {
      name: 'OrderOfOperations',
      input: 'Disp &{-}0+3*2-1',
      expected: '5',
    },
    {
      name: 'OrderOfParenthesis',
      input: 'Disp &{-}(0+3)*(2-1)',
      expected: '-3',
    },
    {
      name: 'RepeatFalse',
      input: ['Repeat 0', 'Disp 1', 'End'],
      expected: '1',
    },
    {
      name: 'RepeatOnce',
      input: ['1->X', 'Repeat X=1', 'Disp 1', '2->X', 'End'],
      expected: '1',
    },
    {
      name: 'WhileFalse',
      input: ['While 0', 'Disp 1', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'WhileOnce',
      input: ['1->X', 'While X=1', 'Disp 1', '2->X', 'End'],
      expected: '1',
    },
    {
      name: 'Increment',
      input: ['5->X', 'IS>(X,6)', 'Disp 1', 'IS>(X,6)', 'Disp 2', 'Disp X'],
      expected: ['1', '7'],
    },
    {
      name: 'Decrement',
      input: ['7->X', 'DS<(X,6)', 'Disp 1', 'DS<(X,6)', 'Disp 2', 'Disp X'],
      expected: ['1', '5'],
    },
    {
      name: 'Numeric',
      input: ['Disp 1', 'Disp 1.0', 'Disp 1.2', 'Disp 1.2&{E}3', 'Disp 0.1&{E}2', 'Disp .1&{E}2', 'Disp 1&{E}2', 'Disp 1.&{E}2', 'Disp 100&{E}-2'],
      expected: ['1', '1', '1.2', '1200', '10', '10', '100', '100', '1'],
    },
    {
      name: 'Theta',
      input: ['1->&{theta}', 'Disp &{theta}'],
      expected: '1',
    },
    {
      name: 'LeadingZero',
      input: 'Disp .1',
      expected: '.1',
    },
    {
      name: 'StringOperations',
      input: ['Disp "foo"', 'Disp "foo"+"bar"', 'Disp "foo"="bar"', 'Disp "foo"!="bar"'],
      expected: ['foo', 'foobar', '0', '1'],
    },
    {
      name: 'StringNumberAdd',
      input: 'Disp "foo"+1',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'NumberStringAdd',
      input: 'Disp 1+"foo"',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'NestedFalseRepeat',
      input: ['If 0', 'Then', 'Repeat 0', 'End', 'Disp 1', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'NestedFalseWhile',
      input: ['If 0', 'Then', 'While 0', 'End', 'Disp 1', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'NoStoreString',
      input: ['1->X', '"A"->X', 'Disp X'],
      expected: '1',
    },
    {
      name: 'GoBack',
      input: ['1->X', 'Lbl A', 'Disp X', '1+X->X', 'If X<3', 'Goto A', 'Disp 9'],
      expected: ['1', '2', '9'],
    },
    {
      name: 'Prompt',
      input: ['Prompt X', 'Disp X'],
      expected: ['X=?1', '1'],
      stdin: '1',
    },
    {
      name: 'PromptEmpty',
      input: ['Prompt X', 'Disp X'],
      expected: ['X=?1', '1'],
      stdin: ['', '1'],
    },
    {
      name: 'PromptExpression',
      input: ['1->X', 'Prompt Y', 'Disp Y'],
      expected: ['Y=?X', '1'],
      stdin: 'X',
    },
    {
      name: 'PromptString',
      input: ['Prompt Str0', 'Disp Str0'],
      expected: ['&{Str0}=?"Hey"', 'Hey'],
      stdin: '"Hey"',
    },
    {
      name: 'PromptNumberString',
      input: ['Prompt X', 'Disp X'],
      expected: ['X=?"A"', '0'],
      stdin: '"A"',
    },
    {
      name: 'PromptNumberList',
      input: ['Prompt X', 'Disp X', 'Disp &{list}X'],
      expected: ['X=?{1,2}', '0', '{1 2}'],
      stdin: '{1,2}',
    },
    {
      name: 'PromptStringNumber',
      input: 'Prompt Str0',
      expected: ['&{Str0}=?1', 'ERR:DATA TYPE'],
      stdin: '1',
    },
    {
      name: 'PromptList',
      input: ['Prompt &{L1}', 'Disp &{L1}'],
      expected: ['&{L1}=?{1,2}', '{1 2}'],
      stdin: '{1,2}',
    },
    {
      name: 'PromptCustomList',
      input: ['Prompt &{list}X', 'Disp &{list}X'],
      expected: ['X=?{1,2}', '{1 2}'],
      stdin: '{1,2}',
    },
    {
      name: 'PromptListNumber',
      input: 'Prompt &{list}X',
      expected: ['X=?1', 'ERR:DATA TYPE'],
      stdin: '1',
    },
    {
      name: 'PromptError',
      input: 'Prompt X',
      expected: ['X=?Foo', 'ERR:SYNTAX'],
      stdin: 'Foo',
    },
    {
      name: 'MultiplyImplicitVariables',
      input: ['2->X', '3->Y', 'Disp XY', 'Disp X&{-}Y', 'Disp XYX'],
      expected: ['6', '-6', '12'],
    },
    {
      name: 'MultiplyImplicitMixed',
      input: ['2->X', 'Disp 3X', 'Disp X3', 'Disp 3X3', 'Disp X3X'],
      expected: ['6', '6', '18', '12'],
    },
    {
      name: 'MultiplyImplicitFail1',
      input: 'Disp 1&{-}1',
      expected: 'ERR:SYNTAX',
    },
    {
      name: 'MultiplyImplicitFail2',
      input: 'Disp X1&{-}1',
      expected: 'ERR:SYNTAX',
    },
    {
      name: 'NestedFalseEmptyCondition',
      input: ['If 0', 'Then', 'If ', 'Then', 'Else', 'End', 'Disp 1', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'EmptyConditionFail',
      input: ['If ', 'Then', 'Disp 1', 'Else', 'Disp 2', 'End'],
      expected: 'ERR:ARGUMENT',
    },
    {
      name: 'ExtraConditionFail',
      input: ['If 1 foo', 'Disp 1'],
      expected: 'ERR:SYNTAX',
    },
    {
      name: 'NestedFalseExtraCondition',
      input: ['If 0', 'Then', 'If 0 foo', 'Then', 'Else', 'End', 'Disp 1', 'End', 'Disp 2'],
      expected: '2',
    },
    {
      name: 'ForLoopDefaultStep',
      input: ['For(X,1,3)', 'Disp X', 'End'],
      expected: ['1', '2', '3'],
    },
    {
      name: 'DisplayUndefinedNumeric',
      input: 'Disp X',
      expected: '0',
    },
    {
      name: 'DisplayUndefinedString',
      input: 'Disp Str0',
      expected: 'ERR:UNDEFINED',
    },
    {
      name: 'DisplayStringVariable',
      input: ['"A"->Str0', 'Disp Str0'],
      expected: 'A',
    },
    {
      name: 'IfString',
      input: ['"A"->Str0', 'If Str0'],
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'IfUndefinedString',
      input: ['If Str0'],
      expected: 'ERR:UNDEFINED',
    },
    {
      name: 'MenuChoice1',
      input: ['Menu("Title","Choice1",A,"Choice2",B)', 'Lbl A', 'Disp 1', 'Lbl B', 'Disp 2'],
      expected: ['Title', '1:Choice1', '2:Choice2', '1', '2'],
      stdin: '1',
    },
    {
      name: 'MenuChoice2',
      input: ['Menu("Title","Choice1",A,"Choice2",B)', 'Lbl A', 'Disp 1', 'Lbl B', 'Disp 2'],
      expected: ['Title', '1:Choice1', '2:Choice2', '2'],
      stdin: '2',
    },
    {
      name: 'MenuInvalidChoices',
      input: ['Menu("Title","Choice",A)', 'Lbl A', 'Disp 1'],
      expected: ['Title', '1:Choice', '1'],
      stdin: ['a', '2', '1'],
    },
    {
      name: 'MenuLableError',
      input: 'Menu("Title","Choice",A)',
      expected: ['Title', '1:Choice', 'ERR:LABEL'],
      stdin: '1',
    },
    {
      name: 'Return',
      input: ['Disp 1', 'Return', 'Disp 2'],
      expected: '1',
    },
    {
      name: 'DelVar',
      input: ['1->X', 'DelVar X', 'Disp X'],
      expected: '0',
    },
    {
      name: 'IncrementUndefined',
      input: 'IS>(X,1)',
      expected: 'ERR:UNDEFINED',
    },
    {
      name: 'IncrementDelVar',
      input: ['1->X', 'DelVar X', 'IS>(X,1)'],
      expected: 'ERR:UNDEFINED',
    },
    {
      name: 'ForDelVar',
      input: ['For(X,1,2)', 'DelVar X', 'End'],
      expected: 'ERR:UNDEFINED',
    },
    {
      name: 'ExtraArguments',
      input: 'For(X,1,1,1,1,1)',
      expected: 'ERR:ARGUMENT',
    },
    {
      name: 'IfAtEnd',
      input: 'If 1',
      expected: 'ERR:SYNTAX',
    },
    {
      name: 'List',
      input: 'Disp {2}',
      expected: '{2}',
    },
    {
      name: 'ListExpression',
      input: 'Disp {2+3}',
      expected: '{5}',
    },
    {
      name: 'ListStringFails',
      input: 'Disp {"A"}',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'ListListFails',
      input: 'Disp {{1}}',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'ListListVariableFails',
      input: ['{1}->&{list}A', 'Disp {&{list}A}'],
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'ListUnary',
      input: ['Disp &{-}{2}', 'Disp &{-}{2,&{-}3}', 'Disp &{-}&{-}{2,3}'],
      expected: ['{-2}', '{-2 3}', '{2 3}'],
    },
    {
      name: 'ListBinary',
      input: [
        'Disp {2}+{3}', 'Disp {2,1}+{3,1}', 'Disp {2,1}-{3,1}', 'Disp {2,1}*{3,1}',
        'Disp {6,1}/{2,1}', 'Disp {2,1}={3,1}', 'Disp {2,1}!={3,1}', 'Disp {2,1}>{3,1}',
        'Disp {2,1}>={3,1}', 'Disp {2,1}<{3,1}', 'Disp {2,1}<={3,1}'],
      expected: [
        '{5}', '{5 2}', '{-1 0}', '{6 1}',
        '{3 1}', '{0 1}', '{1 0}', '{0 0}',
        '{0 1}', '{1 0}', '{1 1}'],
    },
    {
      name: 'ListWithNumber',
      input: ['Disp {2,3}+4', 'Disp 4+{2,3}'],
      expected: ['{6 7}', '{6 7}'],
    },
    {
      name: 'ListWithString',
      input: 'Disp {2}+"A"',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'StringWithList',
      input: 'Disp "A"+{2}',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'ListVariable',
      input: ['{1}->&{L1}', 'Disp &{L1}'],
      expected: '{1}',
    },
    {
      name: 'CustomListVariable',
      input: ['{1}->&{list}A', 'Disp &{list}A'],
      expected: '{1}',
    },
    {
      name: 'UndefinedListVariable',
      input: 'Disp &{L1}',
      expected: 'ERR:UNDEFINED',
    },
    {
      name: 'ListAssignList',
      input: ['{4,9}->&{L1}', '&{L1}->&{L2}', 'Disp &{L2}'],
      expected: '{4 9}',
    },
    {
      name: 'DivideByZero',
      input: 'Disp 1/0',
      expected: 'ERR:DIVIDE BY 0',
    },
    {
      name: 'Ans',
      input: ['1', 'Disp Ans'],
      expected: '1',
    },
    {
      name: 'AnsAssign',
      input: ['1->X', 'Disp Ans'],
      expected: '1',
    },
    {
      name: 'AnsString',
      input: ['"A"->X', 'Disp Ans'],
      expected: 'A',
    },
    {
      name: 'AnsList',
      input: ['{4,9}', 'Disp Ans'],
      expected: '{4 9}',
    },
    {
      name: 'ListIndex',
      input: ['1->X', '{4,9}->&{L1}', 'Disp &{L1}(1)', 'Disp &{L1}(2)', 'Disp &{L1}(X)', 'Disp &{L1}(X+1)'],
      expected: ['4', '9', '4', '9'],
    },
    {
      name: 'ListIndexSmall',
      input: ['{4,9}->&{L1}', 'Disp &{L1}(0)'],
      expected: 'ERR:INVALID DIM',
    },
    {
      name: 'ListIndexLarge',
      input: ['{4,9}->&{L1}', 'Disp &{L1}(3)'],
      expected: 'ERR:INVALID DIM',
    },
    {
      name: 'ListIndexAssign',
      input: ['{4,9}->&{L1}', '5->&{L1}(1+1)', 'Disp &{L1}(2)'],
      expected: '5',
    },
    {
      name: 'ListIndexAssignString',
      input: ['{4}->&{L1}', '"A"->&{L1}(1)'],
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'ListIndexAssignList',
      input: ['{4}->&{L1}', '&{L1}->&{L1}(1)'],
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'Input',
      input: ['Input X', 'Disp X'],
      expected: ['?1', '1'],
      stdin: '1',
    },
    {
      name: 'InputExpression',
      input: ['Input X', 'Disp X'],
      expected: ['?1+1', '2'],
      stdin: '1+1',
    },
    {
      name: 'InputText',
      input: ['Input "IN ",X', 'Disp X'],
      expected: ['IN 1', '1'],
      stdin: '1',
    },
    {
      name: 'InputNoVariable',
      input: 'Input "IN ",',
      expected: 'ERR:ARGUMENT',
    },
    {
      name: 'InputTextInvalid',
      input: 'Input 1,X',
      expected: 'ERR:DATA TYPE',
    },
    {
      name: 'InputNumberString',
      input: ['Input X', 'Disp X'],
      expected: ['?"A"', '0'],
      stdin: '"A"',
    },
    {
      name: 'InputNumberList',
      input: ['Input X', 'Disp X', 'Disp &{list}X'],
      expected: ['?{1,2}', '0', '{1 2}'],
      stdin: '{1,2}',
    },
    {
      name: 'InputString',
      input: ['Input Str0', 'Disp Str0'],
      expected: ['?A', 'A'],
      stdin: 'A',
    },
    {
      name: 'InputStringQuoted',
      input: ['Input Str0', 'Disp Str0'],
      expected: ['?"A"', '"A"'],
      stdin: '"A"',
    },
    {
      name: 'InputList',
      input: ['Input &{L1}', 'Disp &{L1}'],
      expected: ['?{1,2}', '{1 2}'],
      stdin: '{1,2}',
    },
    {
      name: 'Output',
      input: 'Output(1,2,"X")',
      expected: 'X',
    },
    {
      name: 'OutputNumber',
      input: 'Output(1,2,3)',
      expected: '3',
    },
    {
      name: 'OutputPosition',
      input: ['Output(2,3,"A")', 'Output(4,5,"B")'],
      expected: ['AB'],
    },
    {
      name: 'OutputOverflow',
      input: 'Output(1,1,"ABCDEFGHIJKLMNOPQRSTUVWXYZ")',
      expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    },
    {
      name: 'OutputOverflowNoScroll',
      input: 'Output(8,1,"ABCDEFGHIJKLMNOPQRSTUVWXYZ")',
      expected: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    },
    {
      name: 'OutputWithDisp',
      input: ['Disp "AAAA"', 'Disp "BBBB"', 'Disp "CCCC"', 'Output(2,3,"X")', 'Disp "DDDD"'],
      expected: ['AAAA', 'BBBB', 'CCCC', 'XDDDD'],
    },
    {
      name: 'OutputDomain',
      input: 'Output(0,2,3)',
      expected: 'ERR:DOMAIN',
    },
    {
      name: 'OutputDomainHigh',
      input: 'Output(9,2,3)',
      expected: 'ERR:DOMAIN',
    },
    {
      name: 'OutputDomainFloat',
      input: 'Output(1.5,2,3)',
      expected: 'ERR:DOMAIN',
    },
    {
      name: 'OutputDomainColFloat',
      input: 'Output(1,2.5,3)',
      expected: 'ERR:DOMAIN',
    },
    {
      name: 'Empty',
      input: '',
      expected: '',
    },
    {
      name: 'EmptyLines',
      input: [''],
      expected: '',
    },
    {
      name: 'EmptySkip',
      input: ['Disp 1', '', 'Disp 2'],
      expected: ['1', '2'],
    },
    {
      name: 'WhitespaceError',
      input: ' ',
      expected: 'ERR:SYNTAX',
    },
    {
      name: 'OverflowLongString',
      input: 'Disp "ThisIsAVeryLongStringThatExceedsTheScreenWidth"',
      expected: 'ThisIsAVeryLongStringThatExceedsTheScreenWidth',
    },
    {
      name: 'OverflowLongNumber',
      input: 'Disp 1.2345678901234567',
      expected: '1.2345678901234567',
    },
    {
      name: 'OverflowLongList',
      input: 'Disp {1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20}',
      expected: '{1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20}',
    },
    {
      name: 'OverflowLongNumberInputPrompt',
      input: ['Prompt X', 'Disp X'],
      expected: ['X=?1.2345678901234567', '1.2345678901234567'],
      stdin: '1.2345678901234567',
    },
  ],
}

module.exports = tiJsTests
