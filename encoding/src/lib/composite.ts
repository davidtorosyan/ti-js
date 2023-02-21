import { inRanges, ARROW, CUBER, SUPERX } from '../util/hex'
import type { TiTokenInput } from './common'

const alphaRanges: [string, string][] = [
  ['0x0041', '0x005A'],
  ['0xBBB0', '0xBBCA'],
]

const simpleHexRanges: [string, string][] = [
  ['0xBB9F', '0xBBAE'], // greek
  ['0xBBCB', '0xBBCB'], // sigma
  ['0xBBDB', '0xBBF4'], // special
]

const forbiddenHex = [
  '0x00B0', // negative
  '0x621A', // stats e
  '0xBB9C', // umlaut
  '0xBB9D', // upside-down question mark
  '0xBB9E', // upside-down exclamation mark
  '0xBB9B', // grave 2
]

const simpleTokens = [
  'null',
  '->',
  'rad',
  'deg',
  '^-1',
  '^2',
  'transpose',
  '^3',
  'COMMA',
  'NEWLINE',
  'QUOTATION_MARK',
  'UMLAUT',
  'theta',
  '<=',
  '>=',
  '!=',
  'square',
  'plus',
  'dot',
  'pi',
  'squareroot(',
  'list',
  'smallT1',
]

const replacementLookup: [string, string[]][] = [
  ['^2', ['0x000D']],
  ['theta', ['0x005B']],
  ['10', ['0xBBEA']],
  ['e^', ['0xBB31', '0x00F0']],
  ['>', [ARROW]],
  ['root', ['0xBBF3']],
  ['cube', [CUBER]],
  ['xth', [SUPERX]],
]

const noReplaceHex = [
  '0x00DA',
  '0x00DB',
]

const subscriptRanges: [string, string][] = [
  ['0x5D00', '0x5E45'],
  ['0xBBDE', '0xBBEA'],
]

const subscriptMap = new Map([
  ['0', '0xBBE0'],
  ['1', '0xBBE1'],
  ['2', '0xBBE2'],
  ['3', '0xBBE3'],
  ['4', '0xBBE4'],
  ['5', '0xBBE5'],
  ['6', '0xBBE6'],
  ['7', '0xBBE7'],
  ['8', '0xBBE8'],
  ['9', '0xBBE9'],
  ['T', '0xBBCC'],
])

const statsRanges: [string, string][] = [
  ['0x6200', '0x623C'],
]

export function createComposites (input: readonly TiTokenInput[]): Map<TiTokenInput, string[]> {
  const result = new Map<TiTokenInput, string[]>()

  const tokenMap = createTokenMap(input)

  for (const record of input) {
    const composite = createComposite(record.hex, record.token, tokenMap)
    if (composite) {
      result.set(record, composite)
    }
  }

  return result
}

function createTokenMap (input: readonly TiTokenInput[]): Map<string, string> {
  const result = new Map()

  for (const record of input) {
    const token = record.token
    const hex = record.hex

    if (forbiddenHex.includes(hex)) {
      continue
    }

    const storedHex = result.get(token)
    if (storedHex) {
      const alpha = inRanges(hex, alphaRanges)
      const storedAlpha = inRanges(storedHex, alphaRanges)

      if (alpha && !storedAlpha) {
        result.set(token, hex)
      } else if (!alpha && storedAlpha) {
        // do nothing
      } else {
        // should throw
        console.error(
  `Error creating composite token map! Would overwrite ${storedHex} with ${hex} for token ${token}`,
        )
      }
    } else {
      result.set(token, hex)
    }
  }

  return result
}

function createComposite (hex: string, token: string, tokenMap: Map<string, string>): string[] | undefined {
  if (token.length === 1) {
    return undefined
  }

  if (simpleTokens.includes(token)) {
    return undefined
  }

  if (inRanges(hex, statsRanges)) {
    return undefined
  }

  if (inRanges(hex, simpleHexRanges)) {
    return undefined
  }

  const needsSubscript = inRanges(hex, subscriptRanges)
  const noReplace = noReplaceHex.includes(hex)

  const result: string[] = []

  for (let i = 0; i < token.length; i++) {
    const char = token[i]!

    if (needsSubscript) {
      const subscript = subscriptMap.get(char)
      if (subscript) {
        result.push(subscript)
        continue
      }
    }

    if (!noReplace) {
      const kv = mapGetPrefix(replacementLookup, token.substring(i))
      if (kv !== undefined) {
        const [key, value] = kv
        result.push(...value)
        i += key.length - 1
        continue
      }
    }

    const mapped = tokenMap.get(char)
    if (mapped !== undefined) {
      result.push(mapped)
      continue
    }

    throw new Error(`Failed to mapping for char '${char}' at index ${i} in hex: ${hex}`)
  }

  return result
}

function mapGetPrefix<T> (map: [string, T][], keyText: string): [string, T] | undefined {
  for (const [key, value] of map) {
    if (keyText.startsWith(key)) {
      return [key, value]
    }
  }

  return undefined
}
