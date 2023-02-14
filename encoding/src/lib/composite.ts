import { inRanges } from '../util/hex'
import type { TiTokenInput } from './common'

const alphaRanges: [string, string][] = [
  ['0x0041', '0x005A'],
  ['0xBBB0', '0xBBCA'],
]

const simpleHexRanges: [string, string][] = [
  ['0xBB9F', '0xBBAE'], // greek
  ['0xBBCB', ''], // sigma
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
  '->',
  'rad',
  'deg',
  '^-1',
  '^2',
  'transpose',
  '^3',
  'COMMA',
  'NEWLINE',
  'theta',
  '<=',
  '>=',
  '!=',
  'square',
  'plus',
  'dot',
  'pi',
  'squareroot(',
  'cuberoot(',
  'list',
  'root',
  'smallT1',
]

// partial
// 10^(
// L, Y, etc...
// re^thetai

// partial + needs utf8
// X^2cdf(
// X^2pdf(
// X^2-Test(
// X^2GOF-Test(

// special
// e^(

const statsRanges: [string, string][] = [
  ['0x6200', '0x623C'],
]

export function createComposites (input: readonly TiTokenInput[]): Map<TiTokenInput, string> {
  const result = new Map<TiTokenInput, string>()

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

function createComposite (hex: string, token: string, tokenMap: Map<string, string>): string | undefined {
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

  let result = ''
  for (const char of token) {
    result += tokenMap.get(char)
  }

  return result
}
