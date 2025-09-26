// screen
// ======

import encodingJson from '../../gen/encoding.json'

const PIXEL_WIDTH = 3
const PIXEL_HEIGHT = 3
const GLYPH_WIDTH = 5
const GLYPH_HEIGHT = 7
const GLYPH_BUFFER = 1 // Buffer pixels on each side
const EFFECTIVE_GLYPH_WIDTH = GLYPH_WIDTH + (GLYPH_BUFFER * 2) // 7 pixels total
const EFFECTIVE_GLYPH_HEIGHT = GLYPH_HEIGHT + GLYPH_BUFFER // 8 pixels total (7 + 1 bottom buffer)
const SCREEN_COLS = 16
const SCREEN_ROWS = 8
const MARGIN_WIDTH = EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH // Margin width in pixels
const MARGIN_HEIGHT = EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH / 2 // Margin height in pixels

interface GlyphData {
  hex: string
  glyph?: string
  composite?: string[]
  strict?: string
}

export class Screen {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private cursorRow: number = 0
  private cursorCol: number = 0
  private glyphMap: Map<string, string>

  constructor (container: JQuery) {
    // Create canvas and append to container
    this.canvas = document.createElement('canvas')
    this.canvas.width = SCREEN_COLS * EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH + (MARGIN_WIDTH * 2)
    this.canvas.height = SCREEN_ROWS * EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT + (MARGIN_HEIGHT * 2)
    this.canvas.style.border = '2px solid #333'
    this.canvas.style.backgroundColor = '#9fb885'
    this.canvas.style.imageRendering = 'pixelated'

    const ctx = this.canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    this.ctx = ctx

    // Build glyph map from encoding data
    this.glyphMap = new Map()
    for (const record of encodingJson as GlyphData[]) {
      if (record.glyph) {
        this.glyphMap.set(record.hex, record.glyph)
      }
    }

    container.append(this.canvas)
    this.clear()
  }

  clear (): void {
    // Fill entire canvas with lighter green (margin color)
    this.ctx.fillStyle = '#b8d19a'
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Fill screen area with original green
    this.ctx.fillStyle = '#9fb885'
    this.ctx.fillRect(
      MARGIN_WIDTH,
      MARGIN_HEIGHT,
      SCREEN_COLS * EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH,
      SCREEN_ROWS * EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT,
    )

    this.cursorRow = 0
    this.cursorCol = 0
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
      if (this.cursorCol === SCREEN_COLS - 1 && i < chars.length - 1) {
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
    const availableSpace = SCREEN_COLS - this.cursorCol
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

    if (bits.length !== GLYPH_WIDTH * GLYPH_HEIGHT) {
      console.warn(`Glyph bits length mismatch: got ${bits.length}, expected ${GLYPH_WIDTH * GLYPH_HEIGHT}`)
      return
    }

    const startX = MARGIN_WIDTH + col * EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH + GLYPH_BUFFER * PIXEL_WIDTH
    const startY = MARGIN_HEIGHT + row * EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT

    this.ctx.fillStyle = '#000'

    for (let y = 0; y < GLYPH_HEIGHT; y++) {
      for (let x = 0; x < GLYPH_WIDTH; x++) {
        const bitIndex = y * GLYPH_WIDTH + x
        if (bits[bitIndex]) {
          this.ctx.fillRect(
            startX + x * PIXEL_WIDTH,
            startY + y * PIXEL_HEIGHT,
            PIXEL_WIDTH,
            PIXEL_HEIGHT,
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
        return new Array(GLYPH_WIDTH * GLYPH_HEIGHT).fill(false)
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
      return new Array(GLYPH_WIDTH * GLYPH_HEIGHT).fill(false)
    }
  }

  private displayEllipsis (): void {
    // Find the ellipsis glyph
    const ellipsisRecord = encodingJson.find((r: GlyphData) => r.hex === '0xBBDB')
    if (ellipsisRecord?.glyph) {
      // Draw ellipsis at the last column of current row
      this.drawGlyph(ellipsisRecord.glyph, SCREEN_COLS - 1, this.cursorRow)
    }
  }

  private advanceCursor (): void {
    this.cursorCol++
    // Normal advancement - don't auto-wrap, displayText handles overflow
  }

  newLine (): void {
    this.cursorCol = 0
    this.cursorRow++
    if (this.cursorRow >= SCREEN_ROWS) {
      this.scrollUp()
    }
  }

  private scrollUp (): void {
    // Get image data from second row onwards (only the screen area, not margins)
    const imageData = this.ctx.getImageData(
      MARGIN_WIDTH,
      MARGIN_HEIGHT + EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT,
      SCREEN_COLS * EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH,
      SCREEN_ROWS * EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT - EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT,
    )

    // Clear screen area (not margins)
    this.ctx.fillStyle = '#9fb885'
    this.ctx.fillRect(
      MARGIN_WIDTH,
      MARGIN_HEIGHT,
      SCREEN_COLS * EFFECTIVE_GLYPH_WIDTH * PIXEL_WIDTH,
      SCREEN_ROWS * EFFECTIVE_GLYPH_HEIGHT * PIXEL_HEIGHT,
    )

    // Put scrolled content back
    this.ctx.putImageData(imageData, MARGIN_WIDTH, MARGIN_HEIGHT)

    this.cursorRow = SCREEN_ROWS - 1
  }

  setCursor (row: number, col: number): void {
    this.cursorRow = Math.max(0, Math.min(row, SCREEN_ROWS - 1))
    this.cursorCol = Math.max(0, Math.min(col, SCREEN_COLS - 1))
  }
}
