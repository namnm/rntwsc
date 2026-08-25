// Keyed off globalThis so a code-split bundle still shares one value; see
// contribution/internals.md. Key must be app-wide unique, e.g. __rntwscFoo.
export const globalStore = <T>(key: string, init: () => T) => {
  type G = typeof globalThis & Record<string, unknown>
  const g = globalThis as G
  return {
    get: (): T => {
      if (!(key in g)) {
        g[key] = init()
      }
      return g[key] as T
    },
    set: (v: T): void => {
      g[key] = v
    },
  }
}
