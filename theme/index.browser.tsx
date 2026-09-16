'use client'

import BrowserCookies from 'js-cookie'
import { useSyncExternalStore } from 'react'

import {
  getAvailableThemes,
  getThemeClassName,
  themeCookieKey,
  themeCookieMaxAge,
  toValidTheme,
} from 'rntwsc/theme/config'
import { globalStore } from 'rntwsc/utils/global-store'

const initializedG = globalStore('__rntwscThemeInitialized', () => false)
// toValidTheme is only correct after initTheme is called
// so we set it undefined here and let useTheme handle it after initTheme is called
const currentThemeG = globalStore<string | undefined>(
  '__rntwscCurrentTheme',
  () => undefined,
)
const listenersG = globalStore<Set<() => void>>(
  '__rntwscThemeListeners',
  () => new Set(),
)
const notify = () => listenersG.get().forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listenersG.get().add(cb)
  return () => listenersG.get().delete(cb)
}

const getSnapshot = () => {
  if (!initializedG.get()) {
    initializedG.set(true)
    currentThemeG.set(toValidTheme(BrowserCookies.get(themeCookieKey)))
  }
  return currentThemeG.get()
}
// the value is resolved using cookie on initial hydrate
const getSnapshotServer = getSnapshot

export const useTheme = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetTheme = () => (v: string | undefined) => {
  const list = document.documentElement.classList
  for (const theme of getAvailableThemes()) {
    list.remove(theme.className as string)
  }

  v = toValidTheme(v)
  if (v) {
    const className = getThemeClassName(v)
    if (className) {
      list.add(className as string)
    }
    BrowserCookies.set(themeCookieKey, v, {
      expires: themeCookieMaxAge,
    })
  } else {
    BrowserCookies.remove(themeCookieKey)
  }

  currentThemeG.set(v)
  notify()
}
