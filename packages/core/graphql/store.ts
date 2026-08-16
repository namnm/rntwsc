'use client'

import { ApolloClient } from '@apollo/client'
import { InMemoryCache } from '@apollo/client/cache'
import { HttpLink } from '@apollo/client/link/http'
import { useCallback, useSyncExternalStore } from 'react'

import type { GraphQLResponse } from '#/core/graphql/config'
import { hk } from '#/core/graphql/config'
import { drainHydration, subscribeHydration } from '#/core/hydration/store'
import { isBrowser } from '#/core/platform'
import { globalStore } from '#/core/utils/global-store'
import type { StrMap } from '#/libs/utility-types'

// Apollo cache only stores data, not errors, so we keep a parallel error
// store keyed by hydration key for HTTP/GraphQL errors without refetching.
export type HydrationErr = {
  error?: string
  errors?: unknown[]
}
const errStoreG = globalStore<StrMap<HydrationErr>>(
  '__rntwscErrStore',
  () => ({}),
)
const errListenersG = globalStore<Set<() => void>>(
  '__rntwscErrListeners',
  () => new Set(),
)
const notifyErr = () => errListenersG.get().forEach(cb => cb())
const subscribeErr = (cb: () => void) => {
  errListenersG.get().add(cb)
  return () => errListenersG.get().delete(cb)
}
export const useHydrationErr = (k: string) => {
  const fn = useCallback(
    () => errStoreG.get()[k] as HydrationErr | undefined,
    [k],
  )
  return useSyncExternalStore(subscribeErr, fn, fn)
}
export const clearHydrationErr = (k: string) => {
  const errStore = errStoreG.get()
  if (!(k in errStore)) {
    return
  }
  delete errStore[k]
  notifyErr()
}

const apolloStoreG = globalStore<StrMap<ApolloClient>>(
  '__rntwscApolloStore',
  () => ({}),
)
const listenersG = globalStore<Set<() => void>>(
  '__rntwscApolloListeners',
  () => new Set(),
)
const notify = () => listenersG.get().forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listenersG.get().add(cb)
  return () => listenersG.get().delete(cb)
}

export const useApolloClient = (url: string) => {
  const fn = useCallback(() => getApolloClient(url), [url])
  return useSyncExternalStore(subscribe, fn, fn)
}

export const getApolloClient = (url: string) => {
  const store = apolloStoreG.get()
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
  const store = apolloStoreG.get()
  if (!(url in store)) {
    return
  }
  delete store[url]
  if (!silent) {
    notify()
  }
}

export const clearAllApolloClient = ({ silent = false } = {}) => {
  const store = apolloStoreG.get()
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
  const errStore = errStoreG.get()
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
