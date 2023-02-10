import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

interface Unicode {
  hex: string
  name: string
}

interface TiTokenInput {
  hex: string
  token: string
}

interface TiTokenOutput {
  hex: string
  name: string
  strict: string
}

function main (): void {
  const unicodeMap = getUnicodeMap()

  const input = readInput()
  const output = transform(input, unicodeMap)
  writeOutput(output)
}

function transform (input: TiTokenInput[], unicodeMap: Map<string, string>): TiTokenOutput[] {
  const output: TiTokenOutput[] = []

  const names = new Set<string>()

  for (const record of input) {
    const name = createName(record, unicodeMap)
    if (names.has(name)) {
      console.log('Duplicate name for hex!', record.hex, name)
    }
    names.add(name)

    output.push({
      hex: record.hex,
      name,
      strict: createStrict(record.token),
    })
  }

  return output
}

const nameLookup = new Map([
  ['COMMA', ','],
  ['^', 'RAISE'],
  ['->', 'STORE'],
  ['...', 'ELLIPSES'],
  ['<=', 'LESS_EQUAL'],
  ['>=', 'GREATER_EQUAL'],
  ['!=', 'NOT_EQUAL'],
  ['^-1', 'INVERT'],
  ['^2', 'SQUARE'],
  ['^3', 'CUBE'],
  ['e^(', 'E_RAISE'],
  ['10^(', 'TEN_RAISE'],
  ['square', 'BOX_MARK'],
  ['IS>(', 'INCREMENT_SKIP'],
  ['DS<(', 'DECREMENT_SKIP'],
  ['row+(', 'ROW_PLUS'],
  ['*row(', 'ROW_TIMES'],
  ['*row+(', 'ROW_TIMES_PLUS'],
  ['LinReg(a+bx) ', 'LIN_REG_A_BX'],
  ['LinReg(ax+b) ', 'LIN_REG_AX_B'],
  ['tmv_I%', 'TMV_I_PERCENT'],
  ['re^thetai', 'POLAR_MODE'],
  ['a+bi', 'RECT_MODE'],
  ['Seq', 'SEQ_MODE'],
  ['seq', 'SEQ_LIST'],
  ['r^2', 'STATS_LOWER_R_SQUARED'],
  ['R^2', 'STATS_UPPER_R_SQUARED'],
  ['Real', 'REAL_MODE'],
])

const nameHexLookup = new Map([
  ['0x00F1', 'X_ROOT'],
  ['0x002C', 'CONSTANT_I'],
  ['0x003B', 'E_TEN'],
  ['0xBB31', 'CONSTANT_E'],
  ['0x5E80', 'FUNC_U'],
  ['0x5E81', 'FUNC_V'],
  ['0x5E82', 'FUNC_W'],
  ['0x6202', 'ITALIC_N'],
  ['0xBBAD', 'P_HAT'],
  ['0xBBAF', 'BIG_F'],
  ['0xBB9C', 'UMLAUT'],
  ['0xBB9D', 'UPSIDE_DOWN_QUESTION_MARK'],
  ['0xBB9E', 'UPSIDE_DOWN_EXCLAMATION_MARK'],
  ['0xBB9B', 'GRAVE_ACCENT_2'],
  ['0xBBF3', 'ROOT_SIGN'],
  ['0xBBDD', 'CAPS_BETA'],
  ['0xBBDC', 'ANGLE_SIGN'],
  ['0x00B0', 'NEGATIVE'],
  ['0x0071', 'SUBTRACT'],
  ['0x0081', 'DOT_MARK'],
  ['0x0080', 'PLUS_MARK'],
])

const numberedLookup = new Map([
  ['L', 'LIST'],
  ['Y', 'FUNCTION'],
  ['r', 'POLAR'],
  ['Pic', 'PIC'],
  ['GDB', 'GDB'],
])

const statsRange = ['0x6000', '0x623C']

function createName (input: TiTokenInput, unicodeMap: Map<string, string>): string {
  const hex = input.hex
  const token = input.token

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
    // unicode names
    const hex = '00' + token.charCodeAt(0).toString(16).toUpperCase()
    let mapped = unicodeMap.get(hex)
    if (mapped) {
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
    console.log('Unhandled name: ', name)
  }

  return name
}

function createStrict (token: string): string {
  return token
}

function writeOutput (output: TiTokenOutput[]): void {
  const outputFilePath = path.resolve(__dirname, '../dist/output.csv')
  const outDir = path.dirname(outputFilePath)
  const result = stringify(output, {
    delimiter: ',',
    header: true,
  })
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  fs.writeFileSync(outputFilePath, result, { encoding: 'utf-8' })
}

function readInput (): TiTokenInput[] {
  const inputFilePath = path.resolve(__dirname, '../data/input.csv')
  const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' })
  const records: TiTokenInput[] = parse(fileContent, {
    delimiter: ',',
    columns: ['hex', 'token'],
    fromLine: 2,
    quote: false,
  })
  return records
}

function readUnicode (): Unicode[] {
  const inputFilePath = path.resolve(__dirname, '../data/unicode.csv')
  const fileContent = fs.readFileSync(inputFilePath, { encoding: 'utf-8' })
  const records: Unicode[] = parse(fileContent, {
    delimiter: ';',
    columns: ['hex', 'name'],
    quote: false,
    relax_column_count_more: true,
  })
  return records
}

function getUnicodeMap (): Map<string, string> {
  const unicode = readUnicode()
  return new Map(unicode.map(x => [x.hex, x.name]))
}

main()
