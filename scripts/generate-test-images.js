#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const { createCanvas } = require('canvas')

// Import the TI library
const ti = require('../dist/node/ti')

// Import test cases
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

function generateImageForTest (testCase) {
  return new Promise((resolve, reject) => {
    console.log(`Generating image for test: ${testCase.name}`)

    try {
      const lines = ti.parse(trimInput(testCase.input))

      const canvas = createCanvas(800, 600) // Will be resized by Screen class

      const program = ti.run(lines, {
        stdin: trimInput(testCase.stdin),
        screenCanvas: canvas,
        outputCallback: () => {}, // Ignore text output for image generation
        callback: (status) => {
          if (status === 'faulted') {
            reject(new Error(`Test execution faulted: ${testCase.name}`))
            return
          }

          if (status !== 'done' && status !== 'err') {
            // Wait for completion
            return
          }

          // Add a small delay to ensure canvas rendering is complete
          setTimeout(() => {
            try {
              // Canvas is already available, no need to get it from program
              // Save canvas as PNG
              const imgPath = path.join(__dirname, '..', 'web', 'img', testCase.name + '.png')
              const out = fs.createWriteStream(imgPath)
              const stream = canvas.createPNGStream()

              stream.on('data', (chunk) => {
                out.write(chunk)
              })

              stream.on('end', () => {
                out.end()
                console.log(`Generated: ${imgPath}`)
                resolve()
              })

              stream.on('error', (err) => {
                reject(err)
              })
            } catch (error) {
              reject(error)
            }
          }, 10) // Small delay to ensure rendering is complete
        },
      })
    } catch (error) {
      reject(error)
    }
  })
}

async function generateAllImages () {
  console.log('Generating test images...')

  // Ensure web/img directory exists
  const imgDir = path.join(__dirname, '..', 'web', 'img')
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true })
  }

  // Find all test cases
  const screenTests = tiJsTests.testCases

  if (screenTests.length === 0) {
    console.log('No screen tests found.')
    return
  }

  console.log(`Found ${screenTests.length} screen test(s)`)

  // Generate images sequentially to avoid resource conflicts
  for (const testCase of screenTests) {
    try {
      await generateImageForTest(testCase)
    } catch (error) {
      console.error(`Failed to generate image for ${testCase.name}:`, error.message)
    }
  }

  console.log('Image generation complete!')
}

// Run the generator
generateAllImages().catch(error => {
  console.error('Image generation failed:', error)
  process.exit(1)
})
