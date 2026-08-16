'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { hk } from '#/core/fetch/config'
import type { HydrationData } from '#/core/hydration/config'
import { drainHydration, subscribeHydration } from '#/core/hydration/store'
import { isBrowser } from '#/core/platform'
import { globalStore } from '#/core/utils/global-store'
import type { StrMap } from '#/libs/utility-types'

const storeG = globalStore<StrMap<HydrationData>>(
  '__rntwscFetchStore',
  () => ({}),
)
const listenersG = globalStore<Set<() => void>>(
  '__rntwscFetchListeners',
  () => new Set(),
)
const notify = () => listenersG.get().forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listenersG.get().add(cb)
  return () => listenersG.get().delete(cb)
}

export const useFetchData = <T>(k: string) => {
  const fn = useCallback(() => storeG.get()[k], [k])
  return useSyncExternalStore(subscribe, fn, fn) as HydrationData<T> | undefined
}
// to use when we dont need hook
// eg: to merge in action function..
export const getFetchData = <T>(k: string) =>
  storeG.get()[k] as HydrationData<T> | undefined

export const setFetchData = (
  k: string,
  v: HydrationData,
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

export const clearFetchData = (k: string, { silent = false } = {}) => {
  const store = storeG.get()
  if (!(k in store)) {
    return
  }
  delete store[k]
  if (!silent) {
    notify()
  }
}
export const clearAllFetchData = ({ silent = false } = {}) => {
  const store = storeG.get()
  const keys = Object.keys(store)
  if (!keys.length) {
    return
  }
  keys.forEach(k => {
    delete store[k]
  })
  if (!silent) {
    notify()
  }
}

const syncFromHydration = ({ silent = false } = {}) => {
  let found = false
  const store = storeG.get()
  drainHydration(hk, (k, d, v) => {
    if (store[k] !== v) {
      store[k] = v
      found = true
    }
  })
  if (found && !silent) {
    notify()
  }
}
if (isBrowser) {
  syncFromHydration({
    silent: true,
  })
  subscribeHydration(syncFromHydration)
}
