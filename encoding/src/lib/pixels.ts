import * as fs from 'fs'
import * as path from 'path'
import { isHex } from '../util/hex'
import { encodeBits } from '../util/bits'

const COMMENT_MARKER = '#'
const BLANK_PIXEL = '⬜'
const FILLED_PIXEL = '🟦'

const WIDTH = 5
const HEIGHT = 7

export function readGlyphs (): Map<string, string> {
  const results = new Map<string, string>()
  const input = readFile()

  for (const [hex, glyphs] of input) {
    if (results.has(hex)) {
      throw new Error(`Duplicate hex in glyphs: ${hex}`)
    }
    if (isUnknownGlyph(glyphs)) {
      results.set(hex, '')
    } else {
      let bits
      try {
        bits = encode(glyphs)
      } catch (error: any) {
        throw new Error(`Invalid glyphs for hex: ${hex} with message: ${error.message}`)
      }
      const encoded = encodeBits(bits)
      results.set(hex, encoded)
    }
  }

  return results
}

function isUnknownGlyph (glyphs: string[]): boolean {
  return glyphs.length === 1 && glyphs[0] === '?'
}

function encode (glyphs: string[]): boolean[] {
  if (glyphs.length !== HEIGHT) {
    throw new Error(`Invalid height: ${glyphs.length}`)
  }

  const bits: boolean[] = []

  for (const line of glyphs) {
    const chars = [...line]
    if (chars.length !== WIDTH) {
      throw new Error(`Invalid width: ${chars.length}`)
    }

    for (const char of chars) {
      if (char === BLANK_PIXEL) {
        bits.push(false)
      } else if (char === FILLED_PIXEL) {
        bits.push(true)
      } else {
        throw new Error(`Unexpected character: ${char}`)
      }
    }
  }

  return bits
}

function readFile (): [string, string[]][] {
  const inputFilePath = path.resolve(__dirname, '../../data/glyphs.txt')
  const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' })

  const results: [string, string[]][] = []

  let hex: string | undefined
  let glyphs: string[] = []

  function flush (): void {
    if (hex) {
      results.push([hex, glyphs])
      hex = undefined
      glyphs = []
    }
  }

  for (const line of fileContent.split('\n')) {
    const trimmed = trimComments(line)
    if (trimmed.length === 0) {
      if (glyphs.length > 0) {
        flush()
      }
    } else if (isHex(trimmed)) {
      flush()
      hex = trimmed
    } else {
      if (!hex) {
        throw new Error(`Unexpected line while parsing glyphs.txt: ${line}`)
      }
      glyphs.push(trimmed)
    }
  }

  return results
}

function trimComments (line: string): string {
  let trimmed = line
  const commentStart = trimmed.indexOf(COMMENT_MARKER)
  if (commentStart !== -1) {
    trimmed = trimmed.substring(0, commentStart)
  }
  trimmed = trimmed.trim()
  return trimmed
}
