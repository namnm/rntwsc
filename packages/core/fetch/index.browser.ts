'use client'

// no index.native.ts - metro-config falls back to this file directly for
// native too, since this implementation has no server-only calls

import { useCallback, useEffect, useRef, useState } from 'react'

import type { UseFetch } from '#/core/fetch/config'
import { hk } from '#/core/fetch/config'
import { getFetchData, setFetchData, useFetchData } from '#/core/fetch/store'
import type { UseHydrationData } from '#/core/hydration/config'
import { dehydrate } from '#/core/hydration/dehydrate'

const loadings = new Set<string>()

export const useFetch = <T>({
  url,
  headers,
  keySalt,
}: UseFetch): UseHydrationData<T> => {
  const k = hk.key({
    url,
    headers,
    keySalt,
  })
  const v = useFetchData<T>(k)

  // per-instance loading: only this hook shows loading when it triggers a refetch
  const [loading, setLoading] = useState(false)
  const controllerRef = useRef<AbortController | null>(null)

  const refetch = useCallback(() => {
    // abort a still in-flight call for this key before starting a new one,
    // so an out-of-order response can never overwrite a newer result
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller

    setLoading(true)
    loadings.add(k)
    return fetch(url, {
      headers,
      signal: controller.signal,
    })
      .then(r => {
        if (!r.ok) {
          throw new Error(`${r.status} ${r.statusText}`)
        }
        return r.json()
      })
      .then(data => {
        if (controller.signal.aborted) {
          return
        }
        setFetchData(k, {
          data,
          error: undefined,
        })
        setLoading(false)
        loadings.delete(k)
      })
      .catch(err => {
        if (controller.signal.aborted) {
          return
        }
        setFetchData(k, {
          // always keep previous data in cache
          ...getFetchData(k),
          error: String(err),
        })
        setLoading(false)
        loadings.delete(k)
      })
  }, [url, k, headers])

  useEffect(() => {
    if (getFetchData(k) || loadings.has(k)) {
      return
    }
    refetch()
  }, [k, refetch])

  // separate from the effect above so an unstable `refetch` reference (e.g.
  // an inline headers object) re-running it does not spuriously abort a
  // still-valid, already in-flight request - this one only cleans up when
  // the key itself is about to change, or on unmount
  useEffect(
    () => () => {
      controllerRef.current?.abort()
    },
    [k],
  )

  return {
    ...dehydrate(k, v),
    loading: !v || loading,
    refetch,
  }
}
