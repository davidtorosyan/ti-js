import { unicodeLookup } from '../util/unicode'
import type { TiTokenInput } from './common'

const nameLookup = new Map([
  ['->', 'STORE'],
  ['!=', 'NOT_EQUAL'],
  ['...', 'ELLIPSES'],
  ['*row(', 'ROW_TIMES'],
  ['*row+(', 'ROW_TIMES_PLUS'],
  ['^-1', 'INVERT'],
  ['^', 'RAISE'],
  ['^2', 'SQUARE'],
  ['^3', 'CUBE'],
  ['<=', 'LESS_EQUAL'],
  ['>=', 'GREATER_EQUAL'],
  ['10^(', 'TEN_RAISE'],
  ['a+bi', 'RECT_MODE'],
  ['DS<(', 'DECREMENT_SKIP'],
  ['e^(', 'E_RAISE'],
  ['IS>(', 'INCREMENT_SKIP'],
  ['LinReg(a+bx) ', 'LIN_REG_A_BX'],
  ['LinReg(ax+b) ', 'LIN_REG_AX_B'],
  ['r^2', 'STATS_LOWER_R_SQUARED'],
  ['R^2', 'STATS_UPPER_R_SQUARED'],
  ['re^thetai', 'POLAR_MODE'],
  ['Real', 'REAL_MODE'],
  ['row+(', 'ROW_PLUS'],
  ['seq', 'SEQ_LIST'],
  ['Seq', 'SEQ_MODE'],
  ['square', 'BOX_MARK'],
  ['tmv_I%', 'TMV_I_PERCENT'],
])

const nameHexLookup = new Map([
  ['0x002C', 'CONSTANT_I'],
  ['0x003B', 'E_TEN'],
  ['0x0071', 'SUBTRACT'],
  ['0x0080', 'PLUS_MARK'],
  ['0x0081', 'DOT_MARK'],
  ['0x00B0', 'NEGATIVE'],
  ['0x00F1', 'X_ROOT'],
  ['0x5E80', 'FUNC_U'],
  ['0x5E81', 'FUNC_V'],
  ['0x5E82', 'FUNC_W'],
  ['0x6202', 'ITALIC_N'],
  ['0xBB31', 'CONSTANT_E'],
  ['0xBB9B', 'GRAVE_ACCENT_2'],
  ['0xBB9C', 'UMLAUT'],
  ['0xBB9D', 'UPSIDE_DOWN_QUESTION_MARK'],
  ['0xBB9E', 'UPSIDE_DOWN_EXCLAMATION_MARK'],
  ['0xBBAD', 'P_HAT'],
  ['0xBBAF', 'BIG_F'],
  ['0xBBDC', 'ANGLE_SIGN'],
  ['0xBBDD', 'CAPS_BETA'],
  ['0xBBF3', 'ROOT_SIGN'],
])

const numberedLookup = new Map([
  ['GDB', 'GDB'],
  ['L', 'LIST'],
  ['Pic', 'PIC'],
  ['r', 'POLAR'],
  ['Y', 'FUNCTION'],
])

const statsRange = [
  '0x6200',
  '0x623C',
]

export function createNames (input: readonly TiTokenInput[]): Map<TiTokenInput, string> {
  const result = new Map<TiTokenInput, string>()
  const names = new Set<string>()

  for (const record of input) {
    const name = createName(record.hex, record.token)
    if (names.has(name)) {
      throw new Error(`Duplicate name for hex! ${record.hex} ${name}`)
    }
    names.add(name)

    result.set(record, name)
  }

  return result
}

function createName (hex: string, token: string): string {
  const hexLookup = nameHexLookup.get(hex)
  if (hexLookup) {
    return hexLookup
  }

  const statsRelated = hex >= statsRange[0]! && hex <= statsRange[1]!
  if (statsRelated) {
    const alphaMatch = token.match(/^[a-zA-Z]$/)
    if (alphaMatch) {
      return 'STATS_' + token.toUpperCase()
    }
  }

  const lookup = nameLookup.get(token)
  if (lookup) {
    return lookup
  }

  if (token.length === 1) {
    const unicodeHex = '00' + token.charCodeAt(0).toString(16).toUpperCase()
    let mapped = unicodeLookup(unicodeHex)
    if (mapped) {
      mapped = mapped.replace(/LATIN |LETTER |WITH /g, '')
      mapped = mapped.replace(/[ -]/g, '_')
      return mapped
    }
  }

  const numberMatch = token.match(/^(.+)(\d)$/)
  if (numberMatch) {
    const prefix = numberMatch[1]!
    const digit = numberMatch[2]!
    const prefixLookup = numberedLookup.get(prefix)
    if (prefixLookup) {
      return prefixLookup + '_' + digit
    }
  }

  const matrixMatch = token.match(/^\[([A-J])\]$/)
  if (matrixMatch) {
    return 'MATRIX_' + matrixMatch[1]
  }

  let name = token
  name = name.replace(/([a-z])([A-Z])/g, '$1_$2')
  name = name.toUpperCase()
  name = name.trim()
  name = name.replace(/[ -]/g, '_')
  name = name.replace(/[()]/g, '')
  name = name.replace(/^>/, 'TO_')
  name = name.replace(/>/g, '_TO_')
  name = name.replace(/\^2$/, '_SQUARED')
  name = name.replace(/\^2/, '_SQUARED_')
  name = name.replace(/(\d)_([^_]+)/, '$2_$1')
  if (statsRelated) {
    name = 'STATS_' + name
  }

  if (!name.match(/^[A-Z][A-Z0-9_]*$/)) {
    throw new Error(`Unhandled name for hex! ${hex} ${name}`)
  }

  return name
}
