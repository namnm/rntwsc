/* eslint-disable no-restricted-imports */

import type {
  NativeMethods,
  ScrollViewComponent,
  ScrollViewProps,
} from 'react-native'
import { ScrollView } from 'react-native'

import type { StrMap } from '@/core/ts-utils'
import type { CommonProps } from '@/core/tw/components/lib/common-props'
import { normalizePropsRnw } from '@/core/tw/components/lib/normalize-props-rnw'

export type ScrollViewPropsWocn = CommonProps<ScrollViewProps, ScrollViewRn>

// export native type for ref
export type ScrollViewRn = ScrollViewComponent & NativeMethods

export const ScrollViewWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <ScrollView {...props} />
}
