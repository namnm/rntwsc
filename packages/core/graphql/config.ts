import type { OperationVariables, TypedDocumentNode } from '@apollo/client'

import { serverCacheKey } from '#/core/cache/key'
import { hydrationKey } from '#/core/hydration/config'
import type { StrMap } from '#/libs/utility-types'

export const sck = serverCacheKey('rntwsc/graphql', ['fetch'] as const)

export type UseApollo<T = unknown> = {
  url: string
  query: TypedDocumentNode<T>
  variables?: OperationVariables
  headers?: StrMap<string>
}
export const hk = hydrationKey<UseApollo<any>>('graphql')

export type GraphQLResponse<T = unknown> = {
  data?: T
  errors?: unknown[]
}
export const normalizeGraphQLResponse = (d: any) => {
  if (!d) {
    return
  }
  return {
    data: d.data ?? undefined,
    errors: d.errors ?? undefined,
  }
}
