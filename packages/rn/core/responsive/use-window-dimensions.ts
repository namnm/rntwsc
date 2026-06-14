'use client'

import {
  // eslint-disable-next-line no-restricted-imports
  useWindowDimensions as useWindowDimensionsOriginal,
} from 'react-native'

import { useIsMounted } from '@/rn/core/utils/use-is-mounted'
import { isWeb } from '@/rn/platform'

export type DimensionsSize = {
  width: number
  height: number
}

// this is only available in client and native
// !mounted to make sure the data is matched with ssr
export const useWindowDimensions = () => {
  const d: DimensionsSize = useWindowDimensionsOriginal()
  const mounted = useIsMounted()
  if (isWeb && !mounted) {
    return
  }
  return d
}
