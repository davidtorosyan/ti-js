import type { TiTokenInput } from './common'

const utf8TokenLookup = new Map([
  ['->', '→'],
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

  const lookup = utf8TokenLookup.get(record.token)
  if (lookup) {
    return lookup
  }

  const accentRelated = (hex >= accentRange[0]! && hex <= accentRange[1]!) || accents.includes(hex)
  if (accentRelated) {
    return token
  }

  return undefined
}
