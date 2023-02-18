import { write } from '../util/file'
import { createCanvas } from 'canvas'
import { decodeBits } from '../util/bits'
import { UNKNOWN } from '../util/hex'
import { chunkString } from '../util/text'
import type { Canvas } from 'canvas'
import type { TiTokenOutput } from './common'

const PIXEL_WIDTH = 1
const PIXEL_HEIGHT = 1

const WIDTH = 5
const HEIGHT = 7

const MARGIN_HORIZ = 1
const MARGIN_VERT = 2

const GLYPH_WIDTH = WIDTH * PIXEL_WIDTH
const GLYPH_HEIGHT = HEIGHT * PIXEL_HEIGHT

const MARGIN_WIDTH = MARGIN_HORIZ * PIXEL_WIDTH
const MARGIN_HEIGHT = MARGIN_VERT * PIXEL_HEIGHT

export function drawSprites (tokens: TiTokenOutput[], glyphs: Map<string, string>): void {
  const sheetWidth = Math.max(...tokens.map(token => token.length)) * (GLYPH_WIDTH + MARGIN_WIDTH) + MARGIN_WIDTH
  const sheetHeight = tokens.length * (GLYPH_HEIGHT + MARGIN_HEIGHT)

  const canvas = createCanvas(sheetWidth, sheetHeight)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, sheetWidth, sheetHeight)

  const glyphMap = drawGlyphs(glyphs)
  const tokenMap = drawTokens(tokens, glyphMap)

  ctx.translate(MARGIN_WIDTH, 0)
  for (const token of tokenMap.values()) {
    ctx.drawImage(token, 0, 0)
    ctx.translate(0, GLYPH_HEIGHT + MARGIN_HEIGHT)
  }

  const buf = canvas.toBuffer()
  write('draw.png', buf)
}

function drawTokens (tokens: TiTokenOutput[], glyphMap: ReadonlyMap<string, Canvas>): ReadonlyMap<string, Canvas> {
  return new Map(tokens.map(token => [token.hex, drawToken(token, glyphMap)]))
}

function drawToken (token: TiTokenOutput, glyphMap: ReadonlyMap<string, Canvas>): Canvas {
  if (token.composite === undefined) {
    const glyph = glyphMap.get(token.hex)
    if (glyph === undefined) {
      return glyphMap.get(UNKNOWN)!
      // throw new Error(`Missing glyph for hex: ${token.hex}`)
    }
    return glyph
  }

  const chunked = chunkString(token.composite, token.hex.length)
  const tokenWidth = (chunked.length * GLYPH_WIDTH) + ((chunked.length - 1) * MARGIN_WIDTH)

  const canvas = createCanvas(tokenWidth, GLYPH_HEIGHT)
  const ctx = canvas.getContext('2d')

  for (const hex of chunked) {
    let glyph = glyphMap.get(hex)
    if (glyph === undefined) {
      glyph = glyphMap.get(UNKNOWN)!
      // throw new Error(`Missing glyph for hex: ${hex} while trying to render: ${token.hex}`)
    }
    ctx.drawImage(glyph, 0, 0)
    ctx.translate(GLYPH_WIDTH + MARGIN_WIDTH, 0)
  }

  return canvas
}

function drawGlyphs (glyphs: Map<string, string>): ReadonlyMap<string, Canvas> {
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
