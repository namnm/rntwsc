'use client'

import { useCallback, useEffect, useState } from 'react'

import type { UseFetch } from '@/core/fetch/config'
import { hk } from '@/core/fetch/config'
import { getFetchData, setFetchData, useFetchData } from '@/core/fetch/store'
import type { UseHydrationData } from '@/core/hydration/config'
import { dehydrate } from '@/core/hydration/dehydrate'

const loadings = new Set<string>()

export const useFetch = <T>({
  url,
  headers,
}: UseFetch): UseHydrationData<T> => {
  const k = hk.key({
    url,
    headers,
  })
  const v = useFetchData<T>(k)

  // per-instance loading: only this hook shows loading when it triggers a refetch
  const [loading, setLoading] = useState(false)

  const refetch = useCallback(() => {
    setLoading(true)
    loadings.add(k)
    return fetch(url, {
      headers,
    })
      .then(r => {
        if (!r.ok) {
          throw new Error(`${r.status} ${r.statusText}`)
        }
        return r.json()
      })
      .then(data => {
        setFetchData(k, {
          data,
          error: undefined,
        })
        setLoading(false)
        loadings.delete(k)
      })
      .catch(err => {
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

  return {
    ...dehydrate(k, v),
    loading: !v || loading,
    refetch,
  }
}
