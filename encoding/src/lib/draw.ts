import { write } from '../util/file'
import { createCanvas } from 'canvas'
import { decodeBits } from '../util/bits'
import { UNKNOWN } from '../util/hex'
import { chunkString } from '../util/text'
import type { Canvas } from 'canvas'
import type { TiTokenOutput } from './common'

const PIXEL_WIDTH = 10
const PIXEL_HEIGHT = 10

const WIDTH = 5
const HEIGHT = 7

const GLYPH_WIDTH = WIDTH * PIXEL_WIDTH
const GLYPH_HEIGHT = HEIGHT * PIXEL_HEIGHT

const MARGIN_WIDTH = 1

export function drawSprites (tokens: TiTokenOutput[], glyphs: Map<string, string>): void {
  const sheetWidth = 600
  const sheetHeight = 300

  const canvas = createCanvas(sheetWidth, sheetHeight)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, sheetWidth, sheetHeight)

  const glyphMap = drawGlyphs(glyphs)
  const token = drawToken(tokens[117]!, glyphMap)
  ctx.drawImage(token, 0, 0)

  const buf = canvas.toBuffer()
  write('draw.png', buf)
}

function drawToken (token: TiTokenOutput, glyphMap: Map<string, Canvas>): Canvas {
  if (token.composite === undefined) {
    const glyph = glyphMap.get(token.hex)
    if (glyph === undefined) {
      throw new Error(`Missing glyph for hex: ${token.hex}`)
    }
    return glyph
  }

  const chunked = chunkString(token.composite, token.hex.length)
  const tokenWidth = (chunked.length * GLYPH_WIDTH) + ((chunked.length - 1) * MARGIN_WIDTH * PIXEL_WIDTH)

  const canvas = createCanvas(tokenWidth, GLYPH_HEIGHT)
  const ctx = canvas.getContext('2d')

  for (const hex of chunked) {
    let glyph = glyphMap.get(hex)
    if (glyph === undefined) {
      glyph = glyphMap.get(UNKNOWN)!
      // throw new Error(`Missing glyph for hex: ${hex} while trying to render: ${token.hex}`)
    }
    ctx.drawImage(glyph, 0, 0)
    ctx.translate(GLYPH_WIDTH + (MARGIN_WIDTH * PIXEL_WIDTH), 0)
  }

  return canvas
}

function drawGlyphs (glyphs: Map<string, string>): Map<string, Canvas> {
  const unknownGlyph = glyphs.get(UNKNOWN)
  if (unknownGlyph === undefined) {
    throw new Error(`Missing unknown glyph! Need hex: ${UNKNOWN}`)
  }
  const unknownCanvas = drawGlyph(unknownGlyph)

  return new Map(Array.from(glyphs.entries()).map(([hex, glyph]) =>
    [hex, glyph === '' || hex === UNKNOWN ? unknownCanvas : drawGlyph(glyph)]))
}

function drawGlyph (glyph: string): Canvas {
  const canvas = createCanvas(GLYPH_WIDTH, GLYPH_HEIGHT)
  const ctx = canvas.getContext('2d')

  const bits = decodeBits(glyph)

  if (bits.length !== HEIGHT * WIDTH) {
    throw new Error(`Invalid length for glyph: ${glyph.length}`)
  }

  ctx.fillStyle = 'black'

  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      const pixelOn = bits[i * WIDTH + j]
      if (pixelOn) {
        ctx.fillRect(j * PIXEL_HEIGHT, i * PIXEL_WIDTH, PIXEL_WIDTH, PIXEL_HEIGHT)
      }
    }
  }

  return canvas
}
