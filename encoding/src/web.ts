import { createCanvas, loadImage } from 'canvas'
import { read, write } from './util/file'

const BLANK_PIXEL = '⬜'
const FILLED_PIXEL = '🟦'

const BASE = 'http://tibasicdev.wdfiles.com/local--files/83lgfont/'

function main (): void {
  mainAsync().catch(error => { throw new Error(error) })
}

async function mainAsync (): Promise<void> {
  const input = read('web.txt').split('\n')

  const result: string[] = []
  for (const path of input) {
    const url = BASE + path
    const bits = await getBits(url)
    const glyph = getGlyph(bits)

    result.push(path)
    result.push(glyph)
    result.push(' ')
  }

  write('web_glyphs.txt', result.join('\n'))
}

function getGlyph (bits: readonly boolean[][]): string {
  return bits.map(
    line => line.map(bit => bit ? FILLED_PIXEL : BLANK_PIXEL).join(''),
  ).join('\n')
}

async function getBits (imageUrl: string): Promise<readonly boolean[][]> {
  const imageWidth = 40
  const imageHeight = 56

  const numBlocksHoriz = 5
  const numBlocksVert = 7

  const blockWidth = imageWidth / numBlocksHoriz
  const blockHeight = imageHeight / numBlocksVert

  const canvas = createCanvas(imageWidth, imageHeight)
  const ctx = canvas.getContext('2d')

  const glyph = await loadImage(imageUrl)
  ctx.drawImage(glyph, 0, 0)

  const result: boolean[][] = []

  for (let i = 0; i < numBlocksVert; i++) {
    const line: boolean[] = []
    for (let j = 0; j < numBlocksHoriz; j++) {
      const x = blockWidth * j + blockWidth / 2
      const y = blockHeight * i + blockHeight / 2
      const pixel = ctx.getImageData(x, y, 1, 1).data

      let filled
      try {
        filled = isFilled(pixel)
      } catch (error: any) {
        throw new Error(`Failed on ${imageUrl} at (${x}, ${y}) with error: ${error.message}`)
      }

      line.push(filled)
    }
    result.push(line)
  }

  return result
}

function isFilled (pixel: Uint8ClampedArray): boolean {
  const blackThreshold = 30
  const whiteThreshold = 220

  if (pixel.slice(0, 3).every(value => value < blackThreshold)) {
    return true
  }

  if (pixel.slice(0, 3).every(value => value > whiteThreshold)) {
    return false
  }

  throw new Error(`Unable to determine if pixel is filled! Value: ${pixel}`)
}

main()
