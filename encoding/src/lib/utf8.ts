import type { TiTokenInput } from './common'

const excludeTokens = [
  'IS>(',
]

const utf8HexLookup = new Map([
  ['0x0004', '→'],
  ['0x000A', 'ʳ'],
  ['0x000B', '°'],
  ['0x000C', '⁻¹'],
  ['0x000D', '²'],
  ['0x000E', 'ᵀ'],
  ['0x000F', '³'],
  ['0x006D', '≤'],
  ['0x006E', '≥'],
  ['0x006F', '≠'],
  ['0x007F', '□'],
  ['0x0080', '﹢'],
  ['0x0081', '·'],
  ['0x00B0', '˗'],
  ['0x00BC', '√('],
  ['0x00BD', '∛('],
  ['0x00C1', '⏨^('],
  ['0x00EB', '∟'],
  ['0x00F1', '×√'],
  ['0xBB9C', '¨'],
  ['0xBB9D', '¿'],
  ['0xBB9E', '¡'],
  ['0xBB9F', 'α'],
  ['0xBBA0', 'β'],
  ['0xBBA1', 'γ'],
  ['0xBBA2', 'Δ'],
  ['0xBBA3', 'δ'],
  ['0xBBA4', 'ε'],
  ['0xBBA5', 'λ'],
  ['0xBBA6', 'μ'],
  ['0xBBA7', 'π'],
  ['0xBBA8', 'ρ'],
  ['0xBBA9', 'Σ'],
  ['0xBBAB', 'φ'],
  ['0xBBAC', 'Ω'],
  ['0xBBAD', 'p̂'],
  ['0xBBAE', 'χ'],
  ['0xBBCB', 'σ'],
  ['0xBBCC', 'ᵀ'],
  ['0xBBD4', '&'],
  ['0xBBDE', 'ₓ'],
  ['0xBBDF', '┬'],
  ['0xBBF0', '∫'],
  ['0xBBF1', '↑'],
  ['0xBBF2', '↓'],
  ['0xBBF3', '√'],
])

const accentRanges: [string, string][] = [
  ['0xBB6E', '0xBB99'],
  ['0xBBCD', '0xBBCD'],
  ['0xBB9A', '0xBB9A'],
]

const subscriptRanges: [string, string][] = [
  ['0x5D00', '0x5E45'],
  ['0xBBDE', '0xBBEA'],
]

const subscriptMap = new Map([
  ['10', '⏨'],
  ['0', '₀'],
  ['1', '₁'],
  ['2', '₂'],
  ['3', '₃'],
  ['4', '₄'],
  ['5', '₅'],
  ['6', '₆'],
  ['7', '₇'],
  ['8', '₈'],
  ['9', '₉'],
  ['T', '┬'],
])

const replacements = new Map([
  ['>', '⏵'],
  ['theta', 'θ'],
])

export function createUtf8 (record: TiTokenInput, _strict: string): string | undefined {
  const hex = record.hex
  const token = record.token

  if (excludeTokens.includes(token)) {
    return undefined
  }

  const hexLookup = utf8HexLookup.get(hex)
  if (hexLookup) {
    return hexLookup
  }

  const accentRelated = inRanges(hex, accentRanges)
  if (accentRelated) {
    return token
  }

  const needsSubscript = inRanges(hex, subscriptRanges)
  if (needsSubscript) {
    return replaceSubscripts(token)
  }

  if (token.length > 1) {
    let utf8 = token
    for (const [key, value] of replacements) {
      utf8 = utf8.replace(key, value)
    }
    if (utf8 !== token) {
      return utf8
    }
  }

  return undefined
}

function inRanges (hex: string, ranges: [string, string][]): boolean {
  for (const range of ranges) {
    if (hex >= range[0]! && hex <= range[1]!) {
      return true
    }
  }
  return false
}

function replaceSubscripts (token: string): string {
  let result = ''
  for (const char of token) {
    result += subscriptMap.get(char) ?? char
  }
  return result.replace('small', '')
}
