import { useSyncExternalStore } from 'react'

import {
  darkModeCookieKey,
  darkModeDisabled,
  darkModeEnabled,
  darkModeToBolean,
} from '@/core/dark-mode/config'
import { storage } from '@/libs/storage'

let currentDarkMode: boolean | undefined = undefined
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const getSnapshot = () => currentDarkMode
// the value is empty on initial hydrate
const getSnapshotServer = getSnapshot

export const useDarkModeUser = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetDarkMode = () => async (v: boolean | undefined) => {
  if (v === true) {
    await storage.setItem(darkModeCookieKey, darkModeEnabled)
  } else if (v === false) {
    await storage.setItem(darkModeCookieKey, darkModeDisabled)
  } else {
    await storage.removeItem(darkModeCookieKey)
  }
  currentDarkMode = v
  notify()
}

export const initDarkModeNative = async () => {
  const v = await storage.getItem(darkModeCookieKey)
  currentDarkMode = darkModeToBolean(v)
}
