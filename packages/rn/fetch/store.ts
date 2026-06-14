'use client'

import type { ReactNode } from 'react'
import { useCallback, useSyncExternalStore } from 'react'

import { dehydrateDataKey, dehydrateDataValueKey } from '@/rn/fetch/config'
import { dehydrated } from '@/rn/fetch/dehydrate'
import { isBrowser } from '@/rn/platform'
import type { StrMap } from '@/shared/ts-utils'

export type FetchData<T = unknown> = {
  loading?: boolean
  data?: T
  err?: string
}
export type UseFetchData<T = unknown> = FetchData<T> & {
  refetch: () => void
  dehydrateJsx: ReactNode
}

const store: StrMap<FetchData> = {}
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useFetchData = <T>(k: string) => {
  const fn = useCallback(() => store[k], [k])
  return useSyncExternalStore(subscribe, fn, fn) as FetchData<T> | undefined
}
// to use when we dont need hook
// eg: to merge in action function..
export const getFetchData = <T>(k: string) =>
  store[k] as FetchData<T> | undefined

export const setFetchData = (k: string, d: FetchData) => {
  store[k] = d
  notify()
}

export const clearFetchData = (k: string) => {
  delete store[k]
  notify()
}
export const clearAllFetchData = () => {
  Object.keys(store).forEach(k => {
    delete store[k]
  })
  notify()
}

if (isBrowser) {
  document.querySelectorAll(`template[${dehydrateDataKey}]`).forEach(e => {
    const k = e.getAttribute(dehydrateDataKey)
    const v = e.getAttribute(dehydrateDataValueKey)
    if (!k || !v) {
      return
    }
    store[k] = JSON.parse(v)
    dehydrated.add(k)
  })
}
