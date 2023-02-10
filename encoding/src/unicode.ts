import * as fs from 'fs'
import * as path from 'path'
import { parse } from 'csv-parse/sync'

interface Unicode {
    hex: string
    name: string
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

let unicodeMap: Map<string, string> | undefined
function getUnicodeMap (): Map<string, string> {
  if (!unicodeMap) {
    const unicode = readUnicode()
    unicodeMap = new Map(unicode.map(x => [x.hex, x.name]))
  }
  return unicodeMap
}

export function unicodeLookup (key: string): string | undefined {
  return getUnicodeMap().get(key)
}
