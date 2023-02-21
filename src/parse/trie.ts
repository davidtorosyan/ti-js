/* eslint-disable no-use-before-define */

export class Trie {
  private children: Map<string, string | Trie> | undefined
  private terminal: boolean = false

  add (record: string): void {
    if (record === '') {
      this.terminal = true
      return
    }

    if (this.children === undefined) {
      this.children = new Map<string, string | Trie>()
    }

    const index = record[0]!
    const value = record.substring(1)
    const child = this.children.get(index)
    if (child === undefined) {
      this.children.set(index, value)
    } else if (typeof child === 'string') {
      const trie = new Trie()
      trie.add(child)
      trie.add(value)
      this.children.set(index, trie)
    } else {
      child.add(value)
    }
  }

  search (text: string): string | undefined {
    if (text !== '' && this.children !== undefined) {
      const index = text[0]!
      const value = text.substring(1)
      const child = this.children.get(index)
      if (child !== undefined) {
        if (typeof child === 'string') {
          if (value.startsWith(child)) {
            return index + child
          }
        } else {
          const longest = child.search(value)
          if (longest !== undefined) {
            return index + longest
          }
        }
      }
    }

    return this.terminal ? '' : undefined
  }
}
