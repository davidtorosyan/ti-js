// screen
// ======

import { Buffer } from 'buffer'
import {
  GlyphData,
  isGlyphDataSingle,
  isGlyphDataComposite,
  GlyphDataSingle,
  PrintOptions,
  CanvasLike,
  CanvasRenderingContext2DLike,
} from '../../common/core'
import encodingJson from '../../gen/encoding.json'

const UINT32_BYTES = Uint32Array.BYTES_PER_ELEMENT // 3

const MISSING_GLYPH: GlyphDataSingle = {
  hex: '0x0000',
  name: 'CAPITAL_H',
  strict: 'H',
  length: 1,
  glyph: 'IwAAAIxj+MYg',
  virtual: false,
}

export interface ScreenConfig {
  pixelWidth: number
  pixelHeight: number
  glyphWidth: number
  glyphHeight: number
  glyphBuffer: number
  screenCols: number
  screenRows: number
  backgroundColor: string
  marginColor: string
  textColor: string
}

export const DEFAULT_SCREEN_CONFIG: ScreenConfig = {
  pixelWidth: 2,
  pixelHeight: 2,
  glyphWidth: 5,
  glyphHeight: 7,
  glyphBuffer: 1,
  screenCols: 16,
  screenRows: 8,
  backgroundColor: '#9fb885',
  marginColor: '#b8d19a',
  textColor: '#000',
}

export function createScreenConfig (config: Partial<ScreenConfig> = {}): ScreenConfig {
  return { ...DEFAULT_SCREEN_CONFIG, ...config }
}

interface Container {
  append(element: HTMLCanvasElement): void
}

export class Screen {
  private canvas: CanvasLike
  private ctx: CanvasRenderingContext2DLike
  private cursorRow: number = 0
  private cursorCol: number = 0
  private glyphMap: Map<string, GlyphData>
  private hexToGlyphMap: Map<string, GlyphData>
  private ellipsisRecord: GlyphDataSingle
  private config: ScreenConfig
  private effectiveGlyphWidth: number
  private effectiveGlyphHeight: number
  private marginWidth: number
  private marginHeight: number
  private screenWidth: number
  private screenHeight: number
  private rowHeight: number
  private colWidth: number

  constructor (canvasOrContainer: CanvasLike | JQuery | Container, config: Partial<ScreenConfig> = {}) {
    this.config = createScreenConfig(config)

    // Compute derived values
    this.effectiveGlyphWidth = this.config.glyphWidth + (this.config.glyphBuffer * 2)
    this.effectiveGlyphHeight = this.config.glyphHeight + this.config.glyphBuffer
    this.marginWidth = this.effectiveGlyphWidth * this.config.pixelWidth
    this.marginHeight = this.effectiveGlyphWidth * this.config.pixelWidth / 2
    this.rowHeight = this.effectiveGlyphHeight * this.config.pixelHeight
    this.colWidth = this.effectiveGlyphWidth * this.config.pixelWidth
    this.screenWidth = this.config.screenCols * this.colWidth
    this.screenHeight = this.config.screenRows * this.rowHeight

    this.canvas = this.initializeCanvas(canvasOrContainer)

    // Set canvas dimensions
    this.canvas.width = this.screenWidth + (this.marginWidth * 2)
    this.canvas.height = this.screenHeight + (this.marginHeight * 2)

    // Only set style properties in browser environment
    if (typeof document !== 'undefined' && this.canvas.style) {
      this.canvas.style.border = '2px solid #333'
      this.canvas.style.backgroundColor = this.config.backgroundColor
      this.canvas.style.imageRendering = 'pixelated'
    }

    const ctx = this.canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    this.ctx = ctx as CanvasRenderingContext2DLike

    this.glyphMap = new Map()
    this.hexToGlyphMap = new Map()
    this.ellipsisRecord = MISSING_GLYPH

    for (const record of encodingJson as GlyphData[]) {
      this.glyphMap.set(record.strict, record)
      this.hexToGlyphMap.set(record.hex, record)

      // Preprocess ellipsis record
      if (record.hex === '0xBBDB') {
        this.ellipsisRecord = record as GlyphDataSingle
      }
    }

    this.clear()
  }

  private initializeCanvas (canvasOrContainer: CanvasLike | JQuery | Container): CanvasLike {
    if (typeof (canvasOrContainer as CanvasLike).getContext === 'function') {
      return canvasOrContainer as CanvasLike
    }

    const container = canvasOrContainer as JQuery | Container
    const existingCanvas = this.findExistingCanvas(container)

    if (existingCanvas) {
      return existingCanvas
    }

    const canvas = document.createElement('canvas') as CanvasLike
    container.append(canvas as HTMLCanvasElement)
    return canvas
  }

  private findExistingCanvas (container: JQuery | Container): CanvasLike | null {
    if ('querySelector' in container && typeof container.querySelector === 'function') {
      return container.querySelector('canvas') as CanvasLike
    } else if ('find' in container && typeof container.find === 'function') {
      // jQuery-style container
      return container.find('canvas')[0] as CanvasLike || null
    }
    return null
  }

  clear (): void {
    // Fill entire canvas with margin color
    this.ctx.fillStyle = this.config.marginColor
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Fill screen area with background color
    this.ctx.fillStyle = this.config.backgroundColor
    this.ctx.fillRect(
      this.marginWidth,
      this.marginHeight,
      this.screenWidth,
      this.screenHeight,
    )

    this.cursorRow = 0
    this.cursorCol = 0
  }

  print (value: string, printOptions: PrintOptions): void {
    const glyphs = this.toGlyphs(value)
    const colOffset = this.calculateColumnOffset(glyphs.length, printOptions.rightJustify)

    this.drawGlyphs(glyphs, this.cursorCol + colOffset, this.cursorRow, true, printOptions.overflow)
    if (printOptions.newline) {
      this.newLine()
    }
  }

  private calculateColumnOffset (glyphCount: number, rightJustify: boolean): number {
    if (!rightJustify) {
      return 0
    }

    // Calculate where the text should start to be right-justified
    const rightJustifiedStartCol = this.config.screenCols - glyphCount

    // Calculate offset, but never go backwards (minimum offset is 0)
    const offset = rightJustifiedStartCol - this.cursorCol
    return Math.max(0, offset)
  }

  private toGlyphs (text: string): GlyphDataSingle[] {
    const tokens = this.splitValueToStrictTokens(text)
    const glyphs = tokens.map(token => this.glyphMap.get(token)).filter(Boolean) as GlyphData[]
    return this.flattenGlyphs(glyphs)
  }

  private splitValueToStrictTokens (value: string): string[] {
    const tokens: string[] = []
    let currentToken = ''
    let inStrictMode = false

    for (let i = 0; i < value.length; i++) {
      const char = value[i]
      if (char === undefined) continue

      currentToken += char

      if (char === '&') {
        inStrictMode = true
      }

      if (inStrictMode && char === '}') {
        inStrictMode = false
      }

      if (!inStrictMode) {
        tokens.push(currentToken)
        currentToken = ''
      }
    }

    // Handle any remaining characters
    if (currentToken) {
      if (inStrictMode) {
        // Incomplete &{...} pattern, treat as regular characters
        tokens.push(...currentToken.split(''))
      } else {
        // Regular characters
        tokens.push(...currentToken.split(''))
      }
    }

    return tokens
  }

  private flattenGlyphs (glyphs: GlyphData[]): GlyphDataSingle[] {
    const result: GlyphDataSingle[] = []

    for (const glyph of glyphs) {
      if (isGlyphDataSingle(glyph)) {
        result.push(glyph)
      } else if (isGlyphDataComposite(glyph)) {
        for (const hex of glyph.composite) {
          const data = this.hexToGlyphMap.get(hex)
          if (data && isGlyphDataSingle(data)) {
            result.push(data)
          }
        }
      }
    }

    return result
  }

  private drawGlyphs (
    glpyhs: GlyphDataSingle[],
    col: number,
    row: number,
    updateCursor: boolean,
    overflow: boolean,
  ): void {
    for (const glyph of glpyhs) {
      if (col >= this.config.screenCols) {
        if (overflow) {
          col = 0
          row++
        } else {
          this.drawSingleGlyph(this.ellipsisRecord, col - 1, row)
          break
        }
      }

      if (row >= this.config.screenRows) {
        break
      }

      this.drawSingleGlyph(glyph, col, row)
      col++
    }

    if (updateCursor) {
      this.cursorRow = row
      this.cursorCol = col
    }
  }

  private drawSingleGlyph (glyph: GlyphDataSingle, col: number, row: number): void {
    if (glyph === undefined) {
      return
    }

    const bits = this.decodeBits(glyph.glyph)

    if (bits.length !== this.config.glyphWidth * this.config.glyphHeight) {
      console.warn(`Glyph bits length mismatch: got ${bits.length}, ` +
        `expected ${this.config.glyphWidth * this.config.glyphHeight}`)
      return
    }

    const startX = this.marginWidth + col * this.colWidth + this.config.glyphBuffer * this.config.pixelWidth
    const startY = this.marginHeight + row * this.rowHeight

    // Clear the background first
    this.ctx.fillStyle = this.config.backgroundColor
    this.ctx.fillRect(
      startX,
      startY,
      this.config.glyphWidth * this.config.pixelWidth,
      this.config.glyphHeight * this.config.pixelHeight,
    )

    // Draw the glyph
    this.ctx.fillStyle = this.config.textColor
    for (let y = 0; y < this.config.glyphHeight; y++) {
      for (let x = 0; x < this.config.glyphWidth; x++) {
        const bitIndex = y * this.config.glyphWidth + x
        if (bits[bitIndex]) {
          this.ctx.fillRect(
            startX + x * this.config.pixelWidth,
            startY + y * this.config.pixelHeight,
            this.config.pixelWidth,
            this.config.pixelHeight,
          )
        }
      }
    }
  }

  private decodeBits (encoded: string): boolean[] {
    const buffer = Buffer.from(encoded, 'base64')

    const dataLength = buffer.readUint32LE()

    const bytes = Array.from(buffer.subarray(UINT32_BYTES))
    const byteStrings = bytes.map(byte => byte.toString(2).padStart(8, '0'))

    const bitstring = byteStrings.join('')
    const padded = Array.from(bitstring).map(bit => bit === '1')

    const bits = padded.slice(0, dataLength)

    return bits
  }

  private newLine (): void {
    this.cursorRow++
    this.cursorCol = 0
    if (this.cursorRow >= this.config.screenRows) {
      this.scrollUp()
    }
  }

  private scrollUp (): void {
    // Get image data from second row onwards (only the screen area, not margins)
    const imageData = this.ctx.getImageData(
      this.marginWidth,
      this.marginHeight + this.rowHeight,
      this.screenWidth,
      this.screenHeight - this.rowHeight,
    )

    this.clear()

    // Put scrolled content back
    this.ctx.putImageData(imageData, this.marginWidth, this.marginHeight)

    this.cursorRow = this.config.screenRows - 1
  }
}
