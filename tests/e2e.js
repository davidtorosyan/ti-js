const tap = require('tap')
const ti = require('../dist/node/ti')
const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')
const { PNG } = require('pngjs')
const pixelmatch = require('pixelmatch').default

const tiJsTests = require('../web/js/testCases')

function trimInput (text) {
  const indent = tiJsTests.options.indent

  // Handle arrays by joining them first
  if (Array.isArray(text)) {
    return text.join('\n')
  }

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

function compareCanvasToImage (canvas, expectedImagePath) {
  const width = canvas.width
  const height = canvas.height
  const actualData = canvasToImageData(canvas)
  const expectedData = PNG.sync.read(fs.readFileSync(expectedImagePath))

  const numDiffPixels = pixelmatch(
    expectedData.data,
    actualData.data,
    null,
    width,
    height,
    { threshold: 0.1 },
  )
  return numDiffPixels === 0
}

function canvasToImageData (canvas) {
  return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height)
}

async function handleTextResult (testCase, status, output) {
  const testName = testCase.name
  if (status === 'faulted') {
    tap.fail(testName, {
      output,
      expected: testCase.screen || trimInput(testCase.expected),
    })
  } else if (status === 'done' || status === 'err') {
    tap.equal(
      output,
      trimInput(testCase.expected),
      testName,
    )
  } else {
    tap.fail(testName, {
      unexpectedStatus: status,
    })
  }
}

async function handleScreenResult (testCase, status, canvas) {
  const testName = testCase.name + 'Screen'
  if (status === 'faulted') {
    tap.fail(testName)
  } else if (status === 'done' || status === 'err') {
    const expectedImagePath = path.join(__dirname, '..', 'web', 'img', testCase.name + '.png')
    const comparison = compareCanvasToImage(canvas, expectedImagePath)
    tap.ok(comparison, testName)
  } else {
    tap.fail(testName, {
      unexpectedStatus: status,
    })
  }
}

// double up test cases for text and screen
tap.plan(tiJsTests.testCases.length * 2)
tiJsTests.testCases.forEach(testCase => {
  let totalOutput = ''
  const lines = ti.parse(trimInput(testCase.input))

  const canvas = createCanvas(800, 600)

  const runOptions = {
    stdin: trimInput(testCase.stdin),
    outputCallback: (output, newline) => {
      totalOutput += output + (newline ? '\n' : '')
    },
    screenCanvas: canvas,
    callback: async (status) => {
      await handleTextResult(testCase, status, trimLastNewline(totalOutput))
      await handleScreenResult(testCase, status, canvas)
    },
  }

  ti.run(lines, runOptions)
})
