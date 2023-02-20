import encodingJson from '../gen/encoding.json'

export const strictMap = new Map(encodingJson.map(record => [record.hex, record.strict]))
