export function inRanges (hex: string, ranges: [string, string][]): boolean {
  for (const range of ranges) {
    if (hex >= range[0] && (range[1] === '' || hex <= range[1])) {
      return true
    }
  }
  return false
}
