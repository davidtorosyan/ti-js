import type { TiTokenInput } from './common'

const escapeChar = '&'

const transformTokenLookup = new Map([
  ['COMMA', ','],
  ['NEWLINE', 'newline'],
  ['&', escapeChar + 'amp'],
])

const strictHexLookup = new Map([
  ['0x003B', escapeChar + 'E'],
])

const statsRange = [
  '0x6000',
  '0x623C',
]

export function createStricts (input: readonly TiTokenInput[]): Map<TiTokenInput, string> {
  const result = new Map<TiTokenInput, string>()
  const stricts = new Set<string>()

  const transformed: [TiTokenInput, string][] = input.map(record => [record, transform(record.hex, record.token)])
  transformed.sort((a, b) => a[1].length - b[1].length)

  for (const [record, token] of transformed) {
    const strict = createStrict(record.hex, token, stricts)
    stricts.add(strict)
    result.set(record, strict)
  }

  return result
}

function transform (hex: string, token: string): string {
  const hexLookup = strictHexLookup.get(hex)
  if (hexLookup) {
    return hexLookup
  }

  const tokenLookup = transformTokenLookup.get(token)
  if (tokenLookup) {
    return tokenLookup
  }

  const statsRelated = hex >= statsRange[0]! && hex <= statsRange[1]!

  let transformed = token

  if (statsRelated) {
    transformed = 'stats' + transformed
  }

  return transformed
}

function createStrict (hex: string, token: string, existing: ReadonlySet<string>): string {
  if (!prefixIn(token, existing)) {
    return token
  }

  if (token.startsWith(escapeChar)) {
    // throw new Error(`Unable to escape! ${hex} ${token}`)
    console.error(`Unable to escape, would need to double escape! ${hex} ${token}`)
    return token
  }

  const escaped = escapeChar + token
  if (prefixIn(escaped, existing)) {
    // throw new Error(`Still ambiguous after escaping! ${hex} ${token}`)
    console.error(`Still ambiguous after escaping! ${hex} ${token}`)
  }

  return escaped
}

function prefixIn (test: string, existing: ReadonlySet<string>): boolean {
  for (const elem of existing) {
    if (test.startsWith(elem)) {
      return true
    }
  }
  return false
}
