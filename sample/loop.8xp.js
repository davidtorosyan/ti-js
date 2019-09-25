// Produced by ti.js
// ==================

ti.core.prgmNew('loop', [
  [
    { type: 'Assignment', statement: (bus) => { ti.runtime.assign(bus.mem.vars.X, ti.runtime.num('1', '', '')) } },
    { type: 'Assignment', statement: (bus) => { ti.runtime.assign(bus.mem.vars.B, ti.runtime.num('1', '', '')) } },
    { type: 'ForLoop', init: (bus) => { ti.runtime.assign(bus.mem.vars.Y, ti.runtime.num('1', '', '')) }, condition: (bus) => { return ti.runtime.testLessEquals(bus.mem.vars.Y, ti.runtime.num('2', '', '')) }, step: (bus) => { ti.runtime.assign(bus.mem.vars.Y, ti.runtime.add(bus.mem.vars.Y, ti.runtime.num('1', '', ''))) } },
    { type: 'LabelStatement', label: 'A' },
    { type: 'Assignment', statement: (bus) => { ti.runtime.assign(bus.mem.vars.X, ti.runtime.add(bus.mem.vars.X, ti.runtime.num('1', '', ''))) } },
    { type: 'EndStatement' },
    { type: 'IfStatement', condition: (bus) => { return ti.runtime.testEquals(bus.mem.vars.B, ti.runtime.num('1', '', '')) } },
    { type: 'ThenStatement' },
    { type: 'Assignment', statement: (bus) => { ti.runtime.assign(bus.mem.vars.B, ti.runtime.num('2', '', '')) } },
    { type: 'GotoStatement', label: 'A' },
    { type: 'EndStatement' },
    { type: 'IoStatement', statement: (bus) => { ti.runtime.disp(bus.io, bus.mem.vars.X) } }
  ]
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