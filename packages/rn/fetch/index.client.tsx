'use client'

import { useCallback, useEffect } from 'react'

import { dehydrate } from '@/rn/fetch/dehydrate'
import type { UseFetchData } from '@/rn/fetch/store'
import { getFetchData, setFetchData, useFetchData } from '@/rn/fetch/store'

export const useFetch = <T,>(url: string, key = url): UseFetchData<T> => {
  const cache = useFetchData<T>(key)

  const refetch = useCallback(() => {
    setFetchData(key, {
      loading: true,
    })
    fetch(url)
      .then(r => {
        if (!r.ok) {
          throw new Error(`${r.status} ${r.statusText}`)
        }
        return r.json()
      })
      .then(data =>
        setFetchData(key, {
          loading: false,
          data,
          err: undefined,
        }),
      )
      .catch(err =>
        setFetchData(key, {
          // always keep previous data in cache
          ...getFetchData(key),
          loading: false,
          err: String(err),
        }),
      )
  }, [url, key])

  useEffect(() => {
    if (cache !== undefined) {
      return
    }
    refetch()
    // if refetch changed, which mean cache also changed
    // we dont need to include cache in this dependency array
  }, [refetch])

  return {
    ...dehydrate(key, cache),
    refetch,
  }
}
