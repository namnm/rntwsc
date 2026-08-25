'use client'

import BrowserCookies from 'js-cookie'
import { useSyncExternalStore } from 'react'

import {
  darkModeCookieKey,
  darkModeCookieMaxAge,
  darkModeDisabled,
  darkModeEnabled,
  darkModeToBolean,
} from 'rntwsc/dark-mode/config'
import { darkClassName, lightClassName } from 'rntwsc/tw/styles'
import { globalStore } from 'rntwsc/utils/global-store'

const initializedG = globalStore('__rntwscDarkModeInitialized', () => false)
const darkModeG = globalStore<boolean | undefined>(
  '__rntwscDarkMode',
  () => undefined,
)
const listenersG = globalStore<Set<() => void>>(
  '__rntwscDarkModeListeners',
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
    darkModeG.set(darkModeToBolean(BrowserCookies.get(darkModeCookieKey)))
  }
  return darkModeG.get()
}
// the value is resolved using cookie on initial hydrate
const getSnapshotServer = getSnapshot

export const useDarkModeUser = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSetDarkMode = () => (v: boolean | undefined) => {
  const list = document.documentElement.classList
  list.remove(darkClassName)
  list.remove(lightClassName)

  if (v === true) {
    list.add(darkClassName)
    BrowserCookies.set(darkModeCookieKey, darkModeEnabled, {
      expires: darkModeCookieMaxAge,
    })
  } else if (v === false) {
    list.add(lightClassName)
    BrowserCookies.set(darkModeCookieKey, darkModeDisabled, {
      expires: darkModeCookieMaxAge,
    })
  } else {
    BrowserCookies.remove(darkModeCookieKey)
  }

  darkModeG.set(v)
  notify()
}
