'use client'

// no index.native.ts - metro-config falls back to this file directly for
// native too, since this implementation has no server-only calls

import { useQuery } from '@apollo/client/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'

import type { GraphQLResponse, UseApollo } from '#/core/graphql/config'
import { hk, normalizeGraphQLResponse } from '#/core/graphql/config'
import {
  clearHydrationErr,
  useApolloClient,
  useHydrationErr,
} from '#/core/graphql/store'
import type { HydrationData, UseHydrationData } from '#/core/hydration/config'
import { dehydrate } from '#/core/hydration/dehydrate'

// Pure so the "did a request just finish successfully" decision (docs/todo.md
// issue 18) is unit testable without mocking Apollo's useQuery.
export const shouldClearHydrationErrBrowser = (
  wasLoading: boolean,
  isLoading: boolean,
  hasError: boolean,
): boolean => wasLoading && !isLoading && !hasError

export const useFetchGraphQL = <T>({
  url,
  query,
  variables,
  headers,
  keySalt,
}: UseApollo<T>): UseHydrationData<GraphQLResponse<T>> => {
  const k = hk.key({
    url,
    query,
    variables,
    headers,
    keySalt,
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

  const refetchRef = useRef(r.refetch)
  refetchRef.current = r.refetch

  const refetch = useCallback(() => {
    clearHydrationErr(k)
    return refetchRef.current(variables)
  }, [k, variables])

  // clearHydrationErr above only covers our own refetch() - Apollo can also
  // refetch on its own (polling, cache invalidation, network reconnect),
  // and hydrationErr (from the original SSR payload) would otherwise stay
  // set forever even after such a refetch succeeds. Clear it whenever a
  // request just finished with no error, whichever triggered it - not on
  // the initial mount, since wasLoading and r.loading start equal.
  const wasLoadingRef = useRef(r.loading)
  useEffect(() => {
    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = r.loading
    if (shouldClearHydrationErrBrowser(wasLoading, r.loading, !!r.error)) {
      clearHydrationErr(k)
    }
  }, [r.loading, r.error, k])

  const v: HydrationData<GraphQLResponse<T>> = useMemo(() => {
    // only set data when apollo has result or there are graphql errors to surface
    const data: GraphQLResponse<T> | undefined =
      r.data || hydrationErr?.errors
        ? normalizeGraphQLResponse({
            data: r.data,
            errors: hydrationErr?.errors,
          })
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
