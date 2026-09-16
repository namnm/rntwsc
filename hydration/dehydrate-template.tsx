'use client'

import { useLayoutEffect } from 'react'

import { getEnableDedupe } from 'rntwsc/cache/config'
import {
  dehydrateDataKey,
  dehydrateDataValueKey,
} from 'rntwsc/hydration/config'
import type { DehydrateProps } from 'rntwsc/hydration/dehydrate'
import { dehydrated, rehydrated } from 'rntwsc/hydration/dehydrate'
import { setHydration } from 'rntwsc/hydration/store'
import { isBrowser } from 'rntwsc/platform'
import { useIsMounted } from 'rntwsc/libs/hooks'
import { jsonSafe } from 'rntwsc/libs/json-safe'

// Pure so the SSR-vs-hydrate mismatch this guards against (see
// contribution/hydration.md#dehydration-key-collisions-and-keysalt) is unit
// testable without rendering through React/Next.
export const shouldEmbedTemplate = ({
  k,
  dedupeSet,
  enableDedupe,
  isBrowser: isBrowserArg,
  rehydratedSet,
}: {
  k: string
  dedupeSet: Set<string>
  enableDedupe: boolean
  isBrowser: boolean
  rehydratedSet: Set<string>
}): boolean => {
  if (enableDedupe) {
    if (dedupeSet.has(k)) {
      return false
    }
    dedupeSet.add(k)
  }
  // to not dehydrate on browser if this key has no server counterpart
  if (isBrowserArg && !rehydratedSet.has(k)) {
    return false
  }
  return true
}

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

  const embed = shouldEmbedTemplate({
    k,
    dedupeSet: dehydrated(),
    enableDedupe: getEnableDedupe(),
    isBrowser,
    rehydratedSet: rehydrated,
  })
  if (!embed) {
    return null
  }

  // render template instead of script as latest react recommendation
  const props = {
    [dehydrateDataKey]: k,
    [dehydrateDataValueKey]: jsonSafe(v),
  }
  return <template {...props} />
}
