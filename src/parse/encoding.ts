import encodingJson from '../gen/encoding.json'
import { Trie } from './trie'

const TOKEN_START = '&{'
const TOKEN_END = '}'

export const strictTokens = new Set(encodingJson.map(record => record.strict))

export const trie = buildTrie(
  encodingJson
    .filter(record => isEscaped(record.strict))
    .map(record => unescape(record.strict))
    .filter(strict => strict.length > 1),
)

function buildTrie (records: string[]): Trie {
  const trie = new Trie()
  for (const record of records) {
    trie.add(record)
  }
  return trie
}

export function toStrict (line: string): string {
  let result = ''

  let tokenStart: number | undefined
  for (let i = 0; i < line.length; i++) {
    const char = line[i]!
    if (tokenStart !== undefined) {
      result += char
      if (char === TOKEN_END) {
        const token = line.substring(tokenStart, i + 1)
        if (!strictTokens.has(token)) {
          throw new Error(`Unknown strict token found: ${token}`)
        }
        tokenStart = undefined
      }
    } else if (char === TOKEN_START[0]) {
      tokenStart = i
      result += char
    } else {
      const longest = trie.search(line.substring(i))
      if (longest !== undefined) {
        result += escape(longest)
        i += longest.length - 1
      } else if (strictTokens.has(char)) {
        result += char
      } else {
        throw new Error(`Unknown character found: ${char}`)
      }
    }
  }

  if (tokenStart) {
    throw new Error(`Unterminated token escape starting on index: ${tokenStart}`)
  }

  return result
}

export function tok (token: string): string {
  if (strictTokens.has(token)) {
    return token
  }

  const escaped = escape(token)
  if (strictTokens.has(escaped)) {
    return escaped
  }

  throw new Error(`Token not recognized in strict mode!: ${token}`)
}

function escape (token: string): string {
  if (token.includes(TOKEN_END)) {
    throw new Error(`Cannot escape token!: ${token}`)
  }

  return TOKEN_START + token + TOKEN_END
}

function isEscaped (token: string): boolean {
  return token.startsWith(TOKEN_START) && token.endsWith(TOKEN_END)
}

function unescape (token: string): string {
  if (isEscaped(token)) {
    return token.substring(TOKEN_START.length, token.length - TOKEN_END.length)
  }
  return token
}
