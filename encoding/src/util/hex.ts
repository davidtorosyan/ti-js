
export const ARROW = '0xFF00'

export const UNKNOWN = '0xFF01'

export const CUBER = '0xFF02'

export const SUPERX = '0xFF03'

export const strictMapExtra = new Map([
  [ARROW, '&{arrow}'],
  [CUBER, '&{3}'],
  [SUPERX, '&{x}'],
])

const hexPattern = /^0x[0-9a-fA-F]{4}$/

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
