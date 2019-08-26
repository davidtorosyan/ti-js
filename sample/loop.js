// Produced by tipiler
// ==================

tilib.core.prgmNew('loop', [
    { type: 'Assignment', statement: (mem) => { mem.vars.X = tilib.runtime.num('1') } },
    { type: 'Assignment', statement: (mem) => { mem.vars.B = tilib.runtime.num('1') } },
    { type: 'ForLoop', init: (mem) => { mem.vars.Y = tilib.runtime.num('1') }, condition: (mem) => { return tilib.runtime.testLessEquals(mem.vars.Y, tilib.runtime.num('2')) }, step: (mem) => { mem.vars.Y = tilib.runtime.add(mem.vars.Y, tilib.runtime.num('1')) } },
    { type: 'LabelStatement', label: 'A' },
    { type: 'Assignment', statement: (mem) => { mem.vars.X = tilib.runtime.add(mem.vars.X, tilib.runtime.num('1')) } },
    { type: 'EndStatement' },
    { type: 'IfStatement', condition: (mem) => { return tilib.runtime.testEquals(mem.vars.B, tilib.runtime.num('1')) } },
    { type: 'ThenStatement' },
    { type: 'Assignment', statement: (mem) => { mem.vars.B = tilib.runtime.num('2') } },
    { type: 'GotoStatement', label: 'A' },
    { type: 'EndStatement' },
    { type: 'IoStatement', statement: (mem) => { tilib.runtime.disp(mem.vars.X) } }
  ], [
    '1->X',
    '1->B',
    'For(Y,1,2,1)',
    'Lbl A',
    'X+1->X',
    'End',
    'If B=1',
    'Then',
    '2->B',
    'Goto A',
    'End',
    'Disp X'
  ])