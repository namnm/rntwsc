import { useSyncExternalStore } from 'react'

import { themeCookieKey, toValidTheme } from 'rntwsc/theme/config'
import { storage } from 'rntwsc/libs/storage'

let currentTheme: string | undefined = undefined
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => currentTheme
// the value is empty on initial hydrate
const getSnapshotServer = getSnapshot

export const useTheme = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetTheme = () => async (v: string | undefined) => {
  v = toValidTheme(v)
  if (v) {
    await storage.setItem(themeCookieKey, v)
  } else {
    await storage.removeItem(themeCookieKey)
  }
  currentTheme = v
  notify()
}

export const initThemeNative = async () => {
  const v = await storage.getItem(themeCookieKey)
  currentTheme = toValidTheme(v)
}
