/* global ti */

// Sample usage of ti.js
// ==================

ti.parser.download('loop.8xp.txt', (result) => {
  let lines

  // (1)
  // transpile and run the program
  lines = ti.parser.parse(result, { output: 'program' })
  ti.core.run(lines, { debug: false, source: result })

  // (2)
  // transpile and print the program
  // this should be saved in loop.js
  lines = ti.parser.parse(result, { name: 'loop', output: 'source', includeSource: true })
  console.log(lines)
})

// (2 continued)
// once you've saved the program in loop.js,
// just source it and then call exec
ti.core.prgmExec('loop')
