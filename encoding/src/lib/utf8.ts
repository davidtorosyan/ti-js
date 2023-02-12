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
  ['0x00C1', '⏨^('],
  ['0x00EB', '∟'],
  ['0x00F1', '×√'],
  ['0x00BC', '√('],
  ['0x00BD', '∛('],
])

const accentRange: [string, string] = [
  '0xBB6E',
  '0xBB99',
]

const accents = [
  '0xBBCD',
  '0xBB9A',
]

const subscriptRange: [string, string] = [
  '0x5D00',
  '0x5E45',
]

const subscriptMap = new Map([
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

  const accentRelated = inRange(hex, accentRange) || accents.includes(hex)
  if (accentRelated) {
    return token
  }

  const needsSubscript = inRange(hex, subscriptRange)
  if (needsSubscript) {
    return replaceSubscripts(token)
  }

  if (token.length > 1) {
    let utf8 = token
    for (const [key, value] of replacements) {
      utf8 = utf8.replace(key, value)
    }
    if (utf8 !== token) {
      console.log(`found ${utf8} from ${token}`)
      return utf8
    }
  }

  return undefined
}

function inRange (hex: string, range: [string, string]): boolean {
  return hex >= range[0]! && hex <= range[1]!
}

function replaceSubscripts (token: string): string {
  let result = ''
  for (const char of token) {
    result += subscriptMap.get(char) ?? char
  }
  return result
}
