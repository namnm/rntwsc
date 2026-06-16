import { serverCacheKey } from '@/core/cache/key'
import { hydrationKey } from '@/core/hydration/config'
import type { StrMap } from '@/shared/ts-utils'

export const sck = serverCacheKey('@rntwsc/fetch', ['fetch'] as const)

export type UseFetch = {
  url: string
  headers?: StrMap<string>
}
export const hk = hydrationKey<UseFetch>('fetch')
