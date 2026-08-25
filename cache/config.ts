import { globalStore } from 'rntwsc/utils/global-store'
import { initSingleton } from 'rntwsc/utils/init-singleton'

export type CacheConfig = {
  // whether DehydrateTemplate collapses identical-key calls to one <template>
  // marker (true) or lets each render its own (false, the default) - see
  // contribution/hydration.md#dehydration-key-collisions-and-keysalt
  enableDedupe?: boolean
}

// globalThis-keyed, not a plain module-level let - dehydrate-template.tsx is
// pulled into virtually every route, and a code-split bundle can end up with
// more than one copy of this module otherwise. See utils/global-store.ts.
const enableDedupeG = globalStore<boolean>(
  '__rntwscCacheEnableDedupe',
  () => false,
)

const initCacheUnchecked = (config: CacheConfig = {}): void => {
  enableDedupeG.set(config.enableDedupe ?? false)
}
const getEnableDedupeUnchecked = (): boolean => enableDedupeG.get()

export const { initCache, getEnableDedupe } = initSingleton({
  init: {
    initCache: initCacheUnchecked,
  },
  getter: {
    getEnableDedupe: getEnableDedupeUnchecked,
  },
})
