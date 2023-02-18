import * as fs from 'fs'
import * as path from 'path'
import { createCanvas } from 'canvas'

export function drawTest (): void {
  const outputFilePath = path.resolve(__dirname, '../../dist/draw.png')
  const outDir = path.dirname(outputFilePath)

  const canvas = createCanvas(50, 50)
  const ctx = canvas.getContext('2d')
  ctx.fillRect(0, 0, 20, 20)
  const buf = canvas.toBuffer()

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  fs.writeFileSync(outputFilePath, buf)
}
