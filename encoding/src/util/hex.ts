
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
