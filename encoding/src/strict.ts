
const escapeChar = '&'

const strictTokenLookup = new Map([
  ['COMMA', ','],
  ['NEWLINE', escapeChar + 'newline'],
])

const strictHexLookup = new Map([
  ['0x003B', escapeChar + 'E'],
])

const statsRange = [
  '0x6000',
  '0x623C',
]

export function createStrict (hex: string, token: string, existing: ReadonlySet<string>): string {
  const strict = createStrictInternal(hex, token, existing)
  if (prefixIn(strict, existing)) {
    // throw new Error(`Unable to escape! ${hex} ${token}`)
    console.error(`Unable to escape! ${hex} ${token}`)
  }
  return strict
}

function createStrictInternal (hex: string, token: string, existing: ReadonlySet<string>): string {
  const hexLookup = strictHexLookup.get(hex)
  if (hexLookup) {
    return hexLookup
  }

  const statsRelated = hex >= statsRange[0]! && hex <= statsRange[1]!

  const tokenLookup = strictTokenLookup.get(token)
  if (tokenLookup) {
    return tokenLookup
  }

  let strict = token

  if (statsRelated) {
    strict = 'stats' + strict
  }

  if (prefixIn(strict, existing)) {
    strict = escapeChar + strict
  }

  return strict
}

function prefixIn (test: string, existing: ReadonlySet<string>): boolean {
  for (const elem of existing) {
    if (test.startsWith(elem)) {
      return true
    }
  }
  return false
}
