import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

interface TiToken {
  hex: string
  token: string
}

function main (): void {
  const input = readInput()
  console.log(input)
}

function readInput (): TiToken[] {
  const csvFilePath = path.resolve(__dirname, '../data/input.csv')
  const headers = ['hex', 'token']
  const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' })
  const records: TiToken[] = parse(fileContent, {
    delimiter: ',',
    columns: headers,
    fromLine: 2,
  })
  return records
}

main()
