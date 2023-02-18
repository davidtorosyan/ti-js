import { write } from '../util/file'
import { createCanvas } from 'canvas'
import { decodeBits } from '../util/bits'
import type { CanvasRenderingContext2D } from 'canvas'

const PIXEL_WIDTH = 10
const PIXEL_HEIGHT = 10

const WIDTH = 5
const HEIGHT = 7

export function drawSprites (glyph: string): void {
  const canvas = createCanvas(100, 100)
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, 100, 100)

  drawGlyph(ctx, glyph)

  const buf = canvas.toBuffer()
  write('draw.png', buf)
}

function drawGlyph (ctx: CanvasRenderingContext2D, glyph: string): void {
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
}
