import fs from 'fs'
import peggy from 'peggy'
import tspegjs from 'ts-pegjs'

const [inputPath, outputPath] = process.argv.slice(2)
const sourceCode = fs.readFileSync(inputPath).toString()
const outputCode = peggy.generate(sourceCode, {
  output: 'source',
  format: 'commonjs',
  plugins: [
    tspegjs,
  ],
  tspegjs: {
    noTslint: false,
    customHeader: [
      "import * as types from '../common/types'",
      "import * as util from './pegutil'",
    ].join('\n'),
  },
  returnTypes: {
    NumericVariable: 'types.NumericVariable',
  },
})

fs.writeFileSync(outputPath, outputCode)
