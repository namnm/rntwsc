import { serverCacheKey } from '#/core/cache/key'
import { hydrationKey } from '#/core/hydration/config'
import type { StrMap } from '#/libs/utility-types'

export const sck = serverCacheKey('rntwsc/fetch', ['fetch'] as const)

export type UseFetch = {
  url: string
  headers?: StrMap<string>
  // Folded into the hydration key only, never sent in the request.
  // See contribution/hydration.md#dehydration-key-collisions-and-keysalt.
  keySalt?: string
}
export const hk = hydrationKey<UseFetch>('fetch')
