import { print } from 'graphql'

import { serverCache } from '#/core/cache'
import type { GraphQLResponse, UseApollo } from '#/core/graphql/config'
import { hk, normalizeGraphQLResponse, sck } from '#/core/graphql/config'
import type { HydrationData, UseHydrationData } from '#/core/hydration/config'
import { dehydrate } from '#/core/hydration/dehydrate'
import { jsonSafe } from '#/libs/json-safe'

const getCache = <T>() =>
  serverCache(
    sck.fetch,
    () => new Map<string, Promise<HydrationData<GraphQLResponse<T>>>>(),
  )

export const useFetchGraphQL = async <T>({
  url,
  query,
  variables,
  headers,
  keySalt,
}: UseApollo<T>): Promise<UseHydrationData<GraphQLResponse<T>>> => {
  const k = hk.key({
    url,
    query,
    variables,
    headers,
    keySalt,
  })
  const m = getCache<T>()
  let p = m.get(k)
  if (!p) {
    p = fetchWithoutCache({
      url,
      query,
      variables,
      headers,
    })
    m.set(k, p)
  }
  const v = await p
  v.data = normalizeGraphQLResponse(v.data)
  return dehydrate(k, v)
}

const fetchWithoutCache = async <T>({
  url,
  query,
  variables,
  headers,
}: UseApollo<T>): Promise<HydrationData<GraphQLResponse<T>>> => {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: jsonSafe({
        query: print(query),
        variables,
      }),
      cache: 'no-cache',
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
