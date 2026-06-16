import { serverCache } from '@/core/cache'
import type { HydrationData, UseHydrationData } from '@/core/hydration/config'
import { sck } from '@/core/hydration/config'
import { DehydrateTemplate } from '@/core/hydration/dehydrate-template'
import { isServer, isWeb } from '@/core/platform'

// to not dehydrate a key twice
const browserDehydrated = new Set<string>()
export const dehydrated = () =>
  isServer
    ? serverCache(sck.dehydrated, () => new Set<string>())
    : browserDehydrated

// to not dehydrate on browser if this key has no server counterpart
// will be used on browser rehydrate to mark
export const rehydrated = new Set<string>()

export type DehydrateProps = {
  k: string
  v?: HydrationData
}
const Dehydrate = ({ k, v }: DehydrateProps) => {
  if (!v) {
    return null
  }
  // render with effects
  return <DehydrateTemplate k={k} v={v} isServer={isServer} />
}

export const dehydrate = <T,>(
  k: string,
  v: HydrationData<T> | undefined,
): UseHydrationData<T> => ({
  ...v,
  loading: false,
  refetch,
  dehydrateJsx: isWeb ? <Dehydrate k={k} v={v} /> : null,
})

// default noop on the server side
// will be replaced in transpiled variants
const refetch = () => Promise.resolve()
