import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

import { createName } from './name'

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
  const input = readInput()
  const output = transform(input)
  writeOutput(output)
  writeMarkdown(output)
}

function transform (input: TiTokenInput[]): TiTokenOutput[] {
  const output: TiTokenOutput[] = []

  const names = new Set<string>()

  for (const record of input) {
    const name = createName(record.hex, record.token)
    if (names.has(name)) {
      throw new Error(`Duplicate name for hex! ${record.hex} ${name}`)
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

function createStrict (token: string): string {
  return token
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

function writeMarkdown (output: TiTokenOutput[]): void {
  const outputFilePath = path.resolve(__dirname, '../dist/ENCODING.md')
  const outDir = path.dirname(outputFilePath)
  const header = '| hex | name | strict |\n' + '| - | - | - |\n'
  const result = header + stringify(output, {
    delimiter: ' | ',
    cast: {
      string: x => '`' + x + '`',
    },
  })
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  fs.writeFileSync(outputFilePath, result, { encoding: 'utf-8' })
}

main()
