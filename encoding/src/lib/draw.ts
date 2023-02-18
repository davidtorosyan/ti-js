import { write } from '../util/file'
import { createCanvas } from 'canvas'

export function drawTest (): void {
  const canvas = createCanvas(50, 50)
  const ctx = canvas.getContext('2d')
  ctx.fillRect(0, 0, 20, 20)
  const buf = canvas.toBuffer()

  write('draw.png', buf)
}
