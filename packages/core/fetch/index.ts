import { serverCache } from '#/core/cache'
import type { UseFetch } from '#/core/fetch/config'
import { hk, sck } from '#/core/fetch/config'
import type { HydrationData, UseHydrationData } from '#/core/hydration/config'
import { dehydrate } from '#/core/hydration/dehydrate'

const getCache = <T>() =>
  serverCache(sck.fetch, () => new Map<string, Promise<HydrationData<T>>>())

export const useFetch = async <T>({
  url,
  headers,
}: UseFetch): Promise<UseHydrationData<T>> => {
  const k = hk.key({
    url,
    headers,
  })
  const m = getCache<T>()
  let p = m.get(k)
  if (!p) {
    p = fetchWithoutCache({
      url,
      headers,
    })
    m.set(k, p)
  }
  const v = await p
  return dehydrate<T>(k, v)
}

const fetchWithoutCache = async <T>({
  url,
  headers,
}: UseFetch): Promise<HydrationData<T>> => {
  try {
    const r = await fetch(url, {
      headers,
    })
    if (!r.ok) {
      throw new Error(`${r.status} ${r.statusText}`)
    }
    return {
      data: await r.json(),
    }
  } catch (err) {
    return {
      error: String(err),
    }
  }
}
