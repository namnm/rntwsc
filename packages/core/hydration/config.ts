import type { ReactNode } from 'react'

import { serverCacheKey } from '@/core/cache/key'
import { jsonStable } from '@/libs/json-stable'

export const sck = serverCacheKey('rntwsc/hydration', ['dehydrated'] as const)

export const dehydrateDataKey = 'data-dehydrate-key'
export const dehydrateDataValueKey = 'data-dehydrate-value'

export type HydrationKey<T> = {
  key: (d: T) => string
  parse: (key: string) => T | undefined
}
export const hydrationKey = <T>(type: string): HydrationKey<T> => ({
  key: d =>
    jsonStable({
      ...d,
      type,
    }),
  parse: k => {
    try {
      const j = JSON.parse(k)
      if (j.type !== type) {
        return
      }
      return j
    } catch {}
    return
  },
})

export type HydrationData<T = unknown> = {
  data?: T
  error?: string
}
export type UseHydrationData<T = unknown> = HydrationData<T> & {
  loading: boolean
  refetch: () => Promise<unknown>
  dehydrateJsx: ReactNode
}
