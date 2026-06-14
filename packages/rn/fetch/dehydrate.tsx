import { isServer, isWeb } from '@/rn/core/utils/platform'
import { dehydrateDataKey, dehydrateDataValueKey } from '@/rn/fetch/config'
import type { FetchData, UseFetchData } from '@/rn/fetch/store'
import { useRsc } from '@/rn/fetch/use-rsc'
import { jsonSafe } from '@/shared/json-safe'

// will be used on browser rehydrate to mark
export const dehydrated = new Set<string>()

type Props = {
  k: string
  v: unknown
}
const Dehydrate = async ({ k, v }: Props) => {
  const rsc = await useRsc()
  // ignore server rsc fetch mode
  if (rsc) {
    return null
  }
  if (!isServer && !dehydrated.has(k)) {
    return null
  }
  if (!v) {
    return null
  }
  // render template instead of script as latest react recommendation
  const props = {
    [dehydrateDataKey]: k,
    [dehydrateDataValueKey]: jsonSafe(v),
  }
  return <template {...props} />
}

export const dehydrate = <T,>(
  k: string,
  v?: FetchData<T>,
): UseFetchData<T> => ({
  ...v,
  refetch,
  dehydrateJsx: isWeb ? <Dehydrate k={k} v={v} /> : null,
})

// noop on the server side
// if it is being used, it will be always on the client side
const refetch = () => {}
