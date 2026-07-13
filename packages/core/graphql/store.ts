'use client'

import { ApolloClient } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'
import { HttpLink } from '@apollo/client/link/http'
import { useCallback, useSyncExternalStore } from 'react'

import type { GraphQLResponse } from '@/core/graphql/config'
import { hk } from '@/core/graphql/config'
import { drainHydration, subscribeHydration } from '@/core/hydration/store'
import { isBrowser } from '@/core/platform'
import type { StrMap } from '@/libs/utility-types'

// Apollo cache cannot store errors (writeQuery only accepts data).
// We keep a parallel error store keyed by hydration key so the browser hook
// can surface HTTP errors and GraphQL errors without refetching.
export type HydrationErr = {
  error?: string
  errors?: unknown[]
}
const errStore: StrMap<HydrationErr> = {}
const errListeners = new Set<() => void>()
const notifyErr = () => errListeners.forEach(cb => cb())
const subscribeErr = (cb: () => void) => {
  errListeners.add(cb)
  return () => errListeners.delete(cb)
}
export const useHydrationErr = (k: string) => {
  const fn = useCallback(() => errStore[k] as HydrationErr | undefined, [k])
  return useSyncExternalStore(subscribeErr, fn, fn)
}
export const clearHydrationErr = (k: string) => {
  if (!(k in errStore)) {
    return
  }
  delete errStore[k]
  notifyErr()
}

const store: StrMap<ApolloClient> = {}
const listeners = new Set<() => void>()
const notify = () => listeners.forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export const useApolloClient = (url: string) => {
  const fn = useCallback(() => getApolloClient(url), [url])
  return useSyncExternalStore(subscribe, fn, fn)
}

export const getApolloClient = (url: string) => {
  let c = store[url]
  if (!c) {
    c = new ApolloClient({
      link: new HttpLink({
        uri: url,
      }),
      cache: new InMemoryCache(),
      assumeImmutableResults: true,
    })
    store[url] = c
    notify()
  }
  return c
}

export const clearApolloClient = (url: string, { silent = false } = {}) => {
  if (!(url in store)) {
    return
  }
  delete store[url]
  if (!silent) {
    notify()
  }
}

export const clearAllApolloClient = ({ silent = false } = {}) => {
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
  let foundErr = false
  drainHydration(hk, (k, d, v) => {
    const { url, query, variables } = d
    const hydrationErr: HydrationErr = {}
    if (v.error) {
      hydrationErr.error = v.error
    }
    if (v.data) {
      // v.data is the raw GraphQL response body: { data: T, errors?: GraphQLError[] }
      const r = v.data as GraphQLResponse
      if (r.data) {
        getApolloClient(url).writeQuery({
          query,
          variables,
          data: r.data,
        })
        found = true
      }
      hydrationErr.errors = r.errors
    }
    if (hydrationErr.error || hydrationErr.errors?.length) {
      errStore[k] = hydrationErr
      foundErr = true
    } else if (k in errStore) {
      delete errStore[k]
      foundErr = true
    }
  })
  if (found && !silent) {
    notify()
  }
  if (foundErr && !silent) {
    notifyErr()
  }
}
if (isBrowser) {
  syncFromHydration({
    silent: true,
  })
  subscribeHydration(syncFromHydration)
}
