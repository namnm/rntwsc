'use client'

import { useLayoutEffect } from 'react'

import {
  dehydrateDataKey,
  dehydrateDataValueKey,
} from '@/core/hydration/config'
import type { DehydrateProps } from '@/core/hydration/dehydrate'
import { dehydrated, rehydrated } from '@/core/hydration/dehydrate'
import { setHydration } from '@/core/hydration/store'
import { isBrowser } from '@/core/platform'
import { useIsMounted } from '@/core/utils/use-is-mounted'
import { jsonSafe } from '@/shared/json-safe'

type Props = Required<DehydrateProps> & {
  // pass from the caller instead of module level
  isServer: boolean
}
export const DehydrateTemplate = ({ k, v, isServer }: Props) => {
  // notify in use effect
  useLayoutEffect(() => {
    if (isServer) {
      setHydration(k, v)
    }
  }, [k, v, isServer])

  // remove it from dom if mounted
  const mounted = useIsMounted()
  if (mounted) {
    return null
  }

  // to not dehydrate a key twice
  const s = dehydrated()
  if (s.has(k)) {
    return null
  }
  s.add(k)

  // to not dehydrate on browser if this key has no server counterpart
  if (isBrowser && !rehydrated.has(k)) {
    return null
  }

  // render template instead of script as latest react recommendation
  const props = {
    [dehydrateDataKey]: k,
    [dehydrateDataValueKey]: jsonSafe(v),
  }
  return <template {...props} />
}
