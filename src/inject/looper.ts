// looper
// ======

export interface Looper {
    post: (message: string) => void
    on: (message: string, listener: () => void) => void
    off: (message: string, listener: () => void) => void
}