import type { TiTokenInput } from './common'
import { unicodeLookup } from '../util/unicode'

function escape (token: string): string {
  if (token.includes('}')) {
    throw new Error(`Cannot escape token!: ${token}`)
  }

  return '&{' + token + '}'
}

function isEscaped (token: string): boolean {
  return token.startsWith('&{') && token.endsWith('}')
}

function isBrokenEscape (token: string): boolean {
  return token.startsWith('&') && !isEscaped(token)
}

const printableASCIIRegex = /^[\x20-\x7E]+$/

const transformTokenLookup = new Map([
  ['COMMA', ','],
  ['QUOTATION_MARK', '"'],
  ['NEWLINE', 'newline'],
  ['&', escape('amp')],
])

const strictHexLookup = new Map([
  ['0x002C', escape('i')],
  ['0xBB31', escape('e')],
  ['0x003B', escape('E')],
  ['0x5E80', escape('u')],
  ['0x5E81', escape('v')],
  ['0x5E82', escape('w')],
  ['0x00B0', escape('-')],
  ['0xBB9E', escape('!')],
  ['0xBBAF', escape('F')],
  ['0xBB9B', escape('`')],
  ['0xBBCD', escape('I_ACUTE')],
  ['0xBB9A', escape('ACCENT')],
])

const statsRange = [
  '0x6200',
  '0x623C',
]

const accentRange = [
  '0xBB6E',
  '0xBB99',
]

export function createStricts (input: readonly TiTokenInput[]): Map<TiTokenInput, string> {
  const result = new Map<TiTokenInput, string>()
  const stricts = new Set<string>()

  const transformed: [TiTokenInput, string][] = input.map(record => [record, transform(record.hex, record.token)])
  transformed.sort((a, b) => compareToken(a[1], b[1]))

  for (const [record, token] of transformed) {
    const strict = createStrict(record.hex, token, stricts)

    if (!checkValidity(strict)) {
      throw new Error(`Strict token isn't valid! ${record.hex} ${strict}`)
    }

    if (stricts.has(strict)) {
      throw new Error(`Duplicate strict for hex! ${record.hex} ${strict}`)
    }

    stricts.add(strict)
    result.set(record, strict)
  }

  return result
}

function compareToken (a: string, b: string): number {
  if (isEscaped(a) && !isEscaped(b)) {
    return -1
  }

  if (!isEscaped(a) && isEscaped(b)) {
    return 1
  }

  const compareLength = a.length - b.length
  if (compareLength !== 0) {
    return compareLength
  }

  return a.localeCompare(b)
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
  const accentRelated = hex >= accentRange[0]! && hex <= accentRange[1]!

  if (accentRelated && token.length === 1) {
    const unicodeHex = '00' + token.charCodeAt(0).toString(16).toUpperCase()
    let mapped = unicodeLookup(unicodeHex)
    if (mapped) {
      mapped = mapped.replace(/LATIN |CAPITAL |LETTER |WITH /g, '')
      mapped = mapped.replace(/[ -]/g, '_')
      return mapped
    }
  }

  let transformed = token

  if (statsRelated) {
    transformed = 'stats' + transformed
  }

  return transformed
}

function createStrict (_hex: string, token: string, existing: ReadonlySet<string>): string {
  if (isEscaped(token)) {
    return token
  }

  if (!prefixIn(token, existing)) {
    return token
  }

  return escape(token)
}

function prefixIn (test: string, existing: ReadonlySet<string>): boolean {
  for (const elem of existing) {
    if (test.startsWith(elem)) {
      return true
    }
  }
  return false
}

function checkValidity (test: string): boolean {
  return printableASCIIRegex.test(test) && !isBrokenEscape(test)
}
