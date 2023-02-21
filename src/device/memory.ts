// memory
// ====

import { newFloat } from '../common/core'
import type * as types from '../common/types'

export class Memory {
  private vars: Map<string, types.ValueResolved> = new Map<string, types.ValueResolved>()
  private ans: types.ValueResolved = newFloat()

  get (name: string): types.ValueResolved | undefined {
    return this.vars.get(name)
  }

  set (name: string, value: types.ValueResolved): void {
    this.vars.set(name, value)
  }

  del (name: string): void {
    this.vars.delete(name)
  }

  has (name: string): boolean {
    return this.vars.has(name)
  }

  getAns (): types.ValueResolved {
    return this.ans
  }

  setAns (value: types.ValueResolved): void {
    this.ans = value
  }
}
