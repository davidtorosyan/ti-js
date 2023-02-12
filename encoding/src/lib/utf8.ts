import type { TiTokenInput } from './common'

const utf8TokenLookup = new Map([
  ['->', '→'],
])

const utf8HexLookup = new Map([
  ['0x0001', '⏵DMS'],
  ['0x0002', '⏵Dec'],
  ['0x0003', '⏵Frac'],
  ['0x000A', 'ʳ'],
  ['0x000B', '°'],
  ['0x000C', '⁻¹'],
  ['0x000D', '²'],
  ['0x000E', 'ᵀ'],
  ['0x000F', '³'],
  ['0x001B', 'R⏵Pr'],
  ['0x001C', 'R⏵Pθ'],
  ['0x001D', 'P⏵Px'],
  ['0x001E', 'P⏵Py'],
  ['0x005B', 'θ'],
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
])

const accentRange = [
  '0xBB6E',
  '0xBB99',
]

const accents = [
  '0xBBCD',
  '0xBB9A',
]

export function createUtf8 (record: TiTokenInput, _strict: string): string | undefined {
  const hex = record.hex
  const token = record.token

  const hexLookup = utf8HexLookup.get(hex)
  if (hexLookup) {
    return hexLookup
  }

  const lookup = utf8TokenLookup.get(token)
  if (lookup) {
    return lookup
  }

  const accentRelated = (hex >= accentRange[0]! && hex <= accentRange[1]!) || accents.includes(hex)
  if (accentRelated) {
    return token
  }

  return undefined
}
