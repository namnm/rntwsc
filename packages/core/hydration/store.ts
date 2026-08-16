'use client'

import { useCallback, useSyncExternalStore } from 'react'

import type { HydrationData, HydrationKey } from '#/core/hydration/config'
import {
  dehydrateDataKey,
  dehydrateDataValueKey,
} from '#/core/hydration/config'
import { rehydrated } from '#/core/hydration/dehydrate'
import { isBrowser } from '#/core/platform'
import { globalStore } from '#/core/utils/global-store'
import type { StrMap } from '#/libs/utility-types'

const storeG = globalStore<StrMap<HydrationData>>(
  '__rntwscHydrationStore',
  () => ({}),
)
const listenersG = globalStore<Set<() => void>>(
  '__rntwscHydrationListeners',
  () => new Set(),
)
const notify = () => listenersG.get().forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listenersG.get().add(cb)
  return () => listenersG.get().delete(cb)
}

export const useHydration = <T>(k: string) => {
  const fn = useCallback(() => storeG.get()[k], [k])
  return useSyncExternalStore(subscribe, fn, fn) as HydrationData<T> | undefined
}

export const drainHydration = <T>(
  hk: HydrationKey<T>,
  cb: (k: string, d: T, v: HydrationData) => void,
) => {
  const store = storeG.get()
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
  const store = storeG.get()
  if (store[k] === v) {
    return
  }
  store[k] = v
  if (!silent) {
    notify()
  }
}

if (isBrowser) {
  const store = storeG.get()
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
