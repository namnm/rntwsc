'use client'

import { useCallback, useSyncExternalStore } from 'react'

import type { HydrationData, HydrationKey } from '#/core/hydration/config'
import {
  dehydrateDataKey,
  dehydrateDataValueKey,
} from '#/core/hydration/config'
import { rehydrated } from '#/core/hydration/dehydrate'
import { isBrowser } from '#/core/platform'
import type { StrMap } from '#/libs/utility-types'

const store: StrMap<HydrationData> = {}
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useHydration = <T>(k: string) => {
  const fn = useCallback(() => store[k], [k])
  return useSyncExternalStore(subscribe, fn, fn) as HydrationData<T> | undefined
}

export const drainHydration = <T>(
  hk: HydrationKey<T>,
  cb: (k: string, d: T, v: HydrationData) => void,
) => {
  const keys = Object.keys(store)
  keys.forEach(k => {
    const d = hk.parse(k)
    if (!d) {
      return
    }
    const v = store[k]
    delete store[k]
    cb(k, d, v)
  })
}
export const subscribeHydration = subscribe

// should only be used in dehydrate template
export const setHydration = <T>(
  k: string,
  v: HydrationData<T>,
  { silent = false } = {},
) => {
  if (store[k] === v) {
    return
  }
  store[k] = v
  if (!silent) {
    notify()
  }
}

if (isBrowser) {
  document.querySelectorAll(`template[${dehydrateDataKey}]`).forEach(e => {
    const k = e.getAttribute(dehydrateDataKey)
    const v = e.getAttribute(dehydrateDataValueKey)
    if (!k || !v) {
      return
    }
    try {
      store[k] = JSON.parse(v)
      rehydrated.add(k)
    } catch {}
  })
}
