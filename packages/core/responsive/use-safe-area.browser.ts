'use client'

import { useSyncExternalStore } from 'react'
import type { EdgeInsets } from 'react-native-safe-area-context'

import type { ClassName } from '#/core/tw/class-name'
import { globalStore } from '#/core/utils/global-store'

const initializedG = globalStore('__rntwscSafeAreaInitialized', () => false)
const cacheG = globalStore<ReturnType<typeof getInsets>>(
  '__rntwscSafeAreaCache',
  () => undefined,
)

const subscribe = (cb: () => void) => {
  const fn = () => {
    initializedG.set(false)
    cacheG.set(undefined)
    cb()
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fn)
  } else {
    window.addEventListener('resize', fn)
  }
  return () => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', fn)
    } else {
      window.removeEventListener('resize', fn)
    }
  }
}

const getSnapshot = () => {
  if (!initializedG.get()) {
    initializedG.set(true)
    cacheG.set(getInsets())
  }
  return cacheG.get()
}
// server has no method to get safe area
// the value is not available on hydrate
const getSnapshotServer = () => undefined

const useSafeAreaInsetsOriginal = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const useSafeAreaInsets = (): EdgeInsets | undefined =>
  useSafeAreaInsetsOriginal()

export const useSafeAreaPadding = (): ClassName => {
  const d = useSafeAreaInsetsOriginal()
  return (
    d && {
      paddingTop: d.top,
      paddingRight: d.right,
      paddingBottom: d.bottom,
      paddingLeft: d.left,
    }
  )
}

export const useSafeAreaPaddingTop = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.top
  return (
    v && {
      paddingTop: v,
    }
  )
}
export const useSafeAreaPaddingRight = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.right
  return (
    v && {
      paddingRight: v,
    }
  )
}
export const useSafeAreaPaddingBottom = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.bottom
  return (
    v && {
      paddingBottom: v,
    }
  )
}
export const useSafeAreaPaddingLeft = (): ClassName => {
  const v = useSafeAreaInsetsOriginal()?.left
  return (
    v && {
      paddingLeft: v,
    }
  )
}

const getInsets = () => {
  const style = window.getComputedStyle(document.documentElement)
  // meta viewport must be configured properly in html
  // corresponding variables must be set in css
  const [top, left, bottom, right] = ['t', 'l', 'b', 'r']
    .map(v =>
      style
        .getPropertyValue(`--safe-area-inset-${v}`)
        .trim()
        .replace(/[^\d.]/g, ''),
    )
    .map(v => Number(v) || 0)
  if (!top && !left && !bottom && !right) {
    return
  }
  return {
    top,
    left,
    bottom,
    right,
  }
}
