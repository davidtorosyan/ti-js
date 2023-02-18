import { Buffer } from 'buffer'
import { chunkString } from './text'

const BYTE_LENGTH = 8
const UINT32_BYTES = Uint32Array.BYTES_PER_ELEMENT // 3
const MAX_UINT32 = 2 ** (BYTE_LENGTH * UINT32_BYTES) - 1 // 4294967295

export function encodeBits (bits: Readonly<boolean[]>): string {
  if (bits.length > MAX_UINT32) {
    throw new Error(`Too long to encodeBits! Length=${bits.length}`)
  }

  const prefix = Buffer.alloc(UINT32_BYTES)
  prefix.writeUint32LE(bits.length)

  const padded = padBitsToBytes(bits)
  const bitstring = padded.map(Number).join('')

  const byteStrings = chunkString(bitstring, BYTE_LENGTH)
  const bytes = byteStrings.map(byte => parseInt(byte, 2))
  const data = Buffer.from(bytes)

  const result = Buffer.concat([prefix, data])
  const encoded = result.toString('base64')
  return encoded
}

function padBitsToBytes (bits: Readonly<boolean[]>): Readonly<boolean[]> {
  const leftover = bits.length % BYTE_LENGTH

  if (leftover === 0) {
    return bits
  }

  const paddingLength = BYTE_LENGTH - leftover
  const padding: boolean[] = new Array(paddingLength).fill(false)

  return bits.concat(padding)
}

export function decodeBits (encoded: string): boolean[] {
  const buffer = Buffer.from(encoded, 'base64')

  const dataLength = buffer.readUint32LE()

  const bytes = Array.from(buffer.subarray(UINT32_BYTES))
  const byteStrings = bytes.map(byte => byte.toString(2).padStart(8, '0'))

  const bitstring = byteStrings.join('')
  const padded = Array.from(bitstring).map(bit => bit === '1')

  const bits = padded.slice(0, dataLength)

  return bits
}
