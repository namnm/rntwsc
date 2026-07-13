'use client'

import { useCallback, useSyncExternalStore } from 'react'

import { hk } from '@/core/fetch/config'
import type { HydrationData } from '@/core/hydration/config'
import { drainHydration, subscribeHydration } from '@/core/hydration/store'
import { isBrowser } from '@/core/platform'
import type { StrMap } from '@/libs/utility-types'

const store: StrMap<HydrationData> = {}
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useFetchData = <T>(k: string) => {
  const fn = useCallback(() => store[k], [k])
  return useSyncExternalStore(subscribe, fn, fn) as HydrationData<T> | undefined
}
// to use when we dont need hook
// eg: to merge in action function..
export const getFetchData = <T>(k: string) =>
  store[k] as HydrationData<T> | undefined

export const setFetchData = (
  k: string,
  v: HydrationData,
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

export const clearFetchData = (k: string, { silent = false } = {}) => {
  if (!(k in store)) {
    return
  }
  delete store[k]
  if (!silent) {
    notify()
  }
}
export const clearAllFetchData = ({ silent = false } = {}) => {
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
