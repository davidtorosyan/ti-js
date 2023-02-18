import { Buffer } from 'buffer'
import { chunkString } from './text'

const BYTE_LENGTH = 8

export function encodeBits (bits: Readonly<boolean[]>): string {
  const padded = padBitsToBytes(bits)
  const bitstring = padded.map(Number).join('')

  const byteStrings = chunkString(bitstring, BYTE_LENGTH)
  const bytes = byteStrings.map(byte => parseInt(byte, 2))
  const buffer = Buffer.from(bytes)

  const encoded = buffer.toString('base64')
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

  const bytes = Array.from(buffer)
  const byteStrings = bytes.map(byte => byte.toString(2).padStart(8, '0'))

  const bitstring = byteStrings.join('')
  const padded = Array.from(bitstring).map(bit => bit === '1')

  return padded
}
