'use client'

import { useQuery } from '@apollo/client/react'
import { useCallback, useMemo } from 'react'

import type { GraphQLResponse, UseApollo } from '@/core/graphql/config'
import { hk } from '@/core/graphql/config'
import {
  clearHydrationErr,
  useApolloClient,
  useHydrationErr,
} from '@/core/graphql/store'
import type { HydrationData, UseHydrationData } from '@/core/hydration/config'
import { dehydrate } from '@/core/hydration/dehydrate'

export const useApollo = <T>({
  url,
  query,
  variables,
  headers,
}: UseApollo<T>): UseHydrationData<GraphQLResponse<T>> => {
  const k = hk.key({
    url,
    query,
    variables,
    headers,
  })
  const client = useApolloClient(url)
  const r = useQuery(query, {
    client,
    variables,
    context: {
      headers,
    },
    errorPolicy: 'all',
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  })
  const hydrationErr = useHydrationErr(k)

  const refetch = useCallback(() => {
    clearHydrationErr(k)
    return r.refetch(variables)
  }, [k, variables, r.refetch])

  const v: HydrationData<GraphQLResponse<T>> = useMemo(() => {
    // only set data when apollo has result or there are graphql errors to surface
    const data: GraphQLResponse<T> | undefined =
      r.data || hydrationErr?.errors
        ? {
            data: r.data,
            errors: hydrationErr?.errors,
          }
        : undefined
    return {
      data,
      error: hydrationErr?.error || (r.error && String(r.error)),
    }
  }, [hydrationErr, r.error, r.data])

  return {
    ...dehydrate(k, v),
    loading: !hydrationErr && r.loading,
    refetch,
  }
}
