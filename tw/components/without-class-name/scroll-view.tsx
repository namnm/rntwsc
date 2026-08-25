/* eslint-disable no-restricted-imports */

import type {
  NativeMethods,
  ScrollViewComponent,
  ScrollViewProps,
} from 'react-native'
import { ScrollView } from 'react-native'

import type { CommonProps } from 'rntwsc/tw/components/lib/common-props'
import { normalizePropsRnw } from 'rntwsc/tw/components/lib/normalize-props-rnw'
import type { StrMap } from 'rntwsc/libs/utility-types'

export type ScrollViewPropsWocn = CommonProps<ScrollViewProps, ScrollViewRn>

// export native type for ref
export type ScrollViewRn = ScrollViewComponent & NativeMethods

export const ScrollViewWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <ScrollView {...props} />
}
