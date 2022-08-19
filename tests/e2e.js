const tap = require('tap')
const ti = require('../dist/node/ti')

const tiJsTests = require('../web/js/testCases')

function trimInput (text) {
  const indent = tiJsTests.options.indent

  if (text === undefined || text.indexOf('\n') === -1) {
    return text
  }

  return text
    .split('\n')
    .filter((line, index, array) => index !== array.length - 1)
    .map(line => line.substring(indent))
    .join('\n')
}

function trimLastNewline (text) {
  if (text.length > 0) {
    const lastCharacter = text[text.length - 1]
    if (lastCharacter === '\n') {
      text = text.substring(0, text.length - 1)
    }
  }

  return text
}

function handleTestResult (testCase, status, output) {
  if (status === 'faulted') {
    tap.fail(testCase.name, {
      output,
      expected: trimInput(testCase.expected),
    })
  } else if (status === 'done' || status === 'err') {
    tap.equal(
      output,
      trimInput(testCase.expected),
      testCase.name,
    )
  } else {
    tap.fail(testCase.name, {
      unexpectedStatus: status,
    })
  }
}

tap.plan(tiJsTests.testCases.length)
tiJsTests.testCases.forEach(testCase => {
  let totalOutput = ''
  const lines = ti.parse(trimInput(testCase.input))
  ti.run(lines, {
    stdin: trimInput(testCase.stdin),
    outputCallback: (output, newline) => {
      totalOutput += output + (newline ? '\n' : '')
    },
    includeLineNumbers: false,
    callback: status => handleTestResult(testCase, status, trimLastNewline(totalOutput)),
  })
})
