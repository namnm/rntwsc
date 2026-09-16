import { workUnitAsyncStorage } from 'next/dist/server/app-render/work-unit-async-storage.external'

export const serverCache = <T>(k: string, fn: () => T) => {
  const s = workUnitAsyncStorage.getStore() as any
  // not in work unit run
  if (!s) {
    return fn()
  }
  // construct new if not yet
  if (!(k in s)) {
    s[k] = fn()
  }
  return s[k] as T
}
