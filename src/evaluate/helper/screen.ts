// screen
// ======

import { GlyphData } from '../../common/core'
import encodingJson from '../../gen/encoding.json'

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

interface CanvasLike {
  width: number
  height: number
  style?: {
    border?: string
    backgroundColor?: string
    imageRendering?: string
  }
  getContext(contextId: string, options?: { willReadFrequently?: boolean }): CanvasRenderingContext2D | null
}

interface CanvasRenderingContext2DLike {
  fillStyle: string
  fillRect(x: number, y: number, width: number, height: number): void
  getImageData(x: number, y: number, width: number, height: number): ImageData
  putImageData(imageData: ImageData, x: number, y: number): void
}

export class Screen {
  private canvas: CanvasLike
  private ctx: CanvasRenderingContext2DLike
  private cursorRow: number = 0
  private cursorCol: number = 0
  private glyphMap: Map<string, string>
  private config: ScreenConfig
  private effectiveGlyphWidth: number
  private effectiveGlyphHeight: number
  private marginWidth: number
  private marginHeight: number

  constructor (canvasOrContainer: CanvasLike | JQuery | Container, config: Partial<ScreenConfig> = {}) {
    this.config = createScreenConfig(config)

    // Compute derived values
    this.effectiveGlyphWidth = this.config.glyphWidth + (this.config.glyphBuffer * 2)
    this.effectiveGlyphHeight = this.config.glyphHeight + this.config.glyphBuffer
    this.marginWidth = this.effectiveGlyphWidth * this.config.pixelWidth
    this.marginHeight = this.effectiveGlyphWidth * this.config.pixelWidth / 2

    this.canvas = this.initializeCanvas(canvasOrContainer)

    // Set canvas dimensions
    this.canvas.width = this.config.screenCols * this.effectiveGlyphWidth * this.config.pixelWidth +
      (this.marginWidth * 2)
    this.canvas.height = this.config.screenRows * this.effectiveGlyphHeight * this.config.pixelHeight +
      (this.marginHeight * 2)

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
    for (const record of encodingJson as GlyphData[]) {
      if (record.glyph) {
        this.glyphMap.set(record.hex, record.glyph)
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
      this.config.screenCols * this.effectiveGlyphWidth * this.config.pixelWidth,
      this.config.screenRows * this.effectiveGlyphHeight * this.config.pixelHeight,
    )

    this.cursorRow = 0
    this.cursorCol = 0
  }

  display (value: string, newline: boolean, rightJustify?: boolean): void {
    if (rightJustify) {
      this.displayTextRightJustified(value)
      if (newline) {
        this.newLine()
      }
    } else {
      this.displayText(value, newline, rightJustify)
    }
  }

  displayText (text: string, newline: boolean = true, originalValue?: unknown): void {
    // Determine justification based on the actual type of the original value
    const isNumber = originalValue !== undefined ? typeof originalValue === 'number' : false

    if (isNumber) {
      this.displayTextRightJustified(text)
    } else {
      this.displayTextLeftJustified(text)
    }

    if (newline) {
      this.newLine()
    }
  }

  private displayTextLeftJustified (text: string): void {
    const chars: string[] = Array.from(text)

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]

      // Check if we're at the last column and there are more characters
      if (this.cursorCol === this.config.screenCols - 1 && i < chars.length - 1) {
        // Replace this character with ellipsis and stop
        this.displayEllipsis()
        break
      }

      if (char) {
        this.displayChar(char)
      }
    }
  }

  displayTextRightJustified (text: string): void {
    const chars: string[] = Array.from(text)

    // Calculate how many characters we can fit
    const availableSpace = this.config.screenCols - this.cursorCol
    const textLength = chars.length

    if (textLength > availableSpace) {
      // Text is too long, truncate with ellipsis from the left
      this.displayEllipsis()
      const startIndex = textLength - availableSpace + 1
      for (let i = startIndex; i < chars.length; i++) {
        const char = chars[i]
        if (char) {
          this.displayChar(char)
        }
      }
    } else {
      // Text fits, right-justify it
      const padding = availableSpace - textLength

      // Move cursor to the right position
      this.cursorCol += padding

      // Display the text
      for (const char of chars) {
        if (char) {
          this.displayChar(char)
        }
      }
    }
  }

  private displayChar (char: string): void {
    // Find the glyph for this character
    const record = encodingJson.find((r: GlyphData) => r.strict === char)

    if (!record || !record.glyph) {
      // No glyph found - skip this character
      console.warn(`No glyph found for character: "${char}"`)
      this.advanceCursor()
      return
    }

    this.drawGlyph(record.glyph, this.cursorCol, this.cursorRow)
    this.advanceCursor()
  }

  private drawGlyph (glyphData: string, col: number, row: number): void {
    const bits = this.decodeBits(glyphData)

    if (bits.length !== this.config.glyphWidth * this.config.glyphHeight) {
      console.warn(`Glyph bits length mismatch: got ${bits.length}, ` +
        `expected ${this.config.glyphWidth * this.config.glyphHeight}`)
      return
    }

    const startX = this.marginWidth + col * this.effectiveGlyphWidth * this.config.pixelWidth +
      this.config.glyphBuffer * this.config.pixelWidth
    const startY = this.marginHeight + row * this.effectiveGlyphHeight * this.config.pixelHeight

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

  private decodeBits (base64Data: string): boolean[] {
    try {
      const binaryString = atob(base64Data)

      // First 4 bytes are the data length as little-endian uint32
      if (binaryString.length < 4) {
        console.warn('Glyph data too short for length prefix')
        return new Array(this.config.glyphWidth * this.config.glyphHeight).fill(false)
      }

      const dataLength =
        (binaryString.charCodeAt(0) & 0xFF) |
        ((binaryString.charCodeAt(1) & 0xFF) << 8) |
        ((binaryString.charCodeAt(2) & 0xFF) << 16) |
        ((binaryString.charCodeAt(3) & 0xFF) << 24)

      // Extract bits from remaining bytes
      const bits: boolean[] = []
      for (let i = 4; i < binaryString.length; i++) {
        const byte = binaryString.charCodeAt(i)
        for (let bit = 7; bit >= 0; bit--) {
          bits.push((byte & (1 << bit)) !== 0)
        }
      }

      // Return only the specified number of bits (removing padding)
      return bits.slice(0, dataLength)
    } catch (e) {
      console.warn('Error decoding glyph bits:', e)
      return new Array(this.config.glyphWidth * this.config.glyphHeight).fill(false)
    }
  }

  private displayEllipsis (): void {
    // Find the ellipsis glyph
    const ellipsisRecord = encodingJson.find((r: GlyphData) => r.hex === '0xBBDB')
    if (ellipsisRecord?.glyph) {
      // Draw ellipsis at the last column of current row
      this.drawGlyph(ellipsisRecord.glyph, this.config.screenCols - 1, this.cursorRow)
    }
  }

  private advanceCursor (): void {
    this.cursorCol++
    // Normal advancement - don't auto-wrap, displayText handles overflow
  }

  private newLine (): void {
    this.cursorCol = 0
    this.cursorRow++
    if (this.cursorRow >= this.config.screenRows) {
      this.scrollUp()
    }
  }

  private scrollUp (): void {
    // Get image data from second row onwards (only the screen area, not margins)
    const imageData = this.ctx.getImageData(
      this.marginWidth,
      this.marginHeight + this.effectiveGlyphHeight * this.config.pixelHeight,
      this.config.screenCols * this.effectiveGlyphWidth * this.config.pixelWidth,
      this.config.screenRows * this.effectiveGlyphHeight * this.config.pixelHeight -
        this.effectiveGlyphHeight * this.config.pixelHeight,
    )

    // Clear screen area (not margins)
    this.ctx.fillStyle = this.config.backgroundColor
    this.ctx.fillRect(
      this.marginWidth,
      this.marginHeight,
      this.config.screenCols * this.effectiveGlyphWidth * this.config.pixelWidth,
      this.config.screenRows * this.effectiveGlyphHeight * this.config.pixelHeight,
    )

    // Put scrolled content back
    this.ctx.putImageData(imageData, this.marginWidth, this.marginHeight)

    this.cursorRow = this.config.screenRows - 1
  }
}
