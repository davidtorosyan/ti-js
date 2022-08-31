// event
// =====

export interface EventTarget {
    addEventListener: (type: string, listener: () => void) => void
    removeEventListener: (type: string, listener: () => void) => void
    dispatchEvent: (name: string) => void
}
