
export const ARROW = '0xFF00'

export const ARROW_STRICT = '&{arrow}'

const hexPattern = /^0x[0-9a-fA-F]/

export function inRanges (hex: string, ranges: [string, string][]): boolean {
  for (const range of ranges) {
    const low = range[0]
    const high = range[1] === '' ? low : range[1]
    if (hex >= low && hex <= high) {
      return true
    }
  }
  return false
}

export function isHex (text: string): boolean {
  return hexPattern.test(text)
}
