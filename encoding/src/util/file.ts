import * as fs from 'fs'
import * as path from 'path'

export function read (name: string): string {
  const inputPath = path.resolve(__dirname, '../../data/', name)
  return fs.readFileSync(inputPath, { encoding: 'utf-8' })
}

export function write (name: string, data: string | Buffer): void {
  const outputPath = path.resolve(__dirname, '../../dist/', name)
  const outDir = path.dirname(outputPath)
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir)
  }
  const encoding = data instanceof String ? 'utf-8' : 'binary'
  fs.writeFileSync(outputPath, data, { encoding })
}
