/* eslint-disable no-restricted-imports */

import type { NativeMethods, ViewComponent, ViewProps } from 'react-native'
import { View } from 'react-native'

import type { StrMap } from '@/core/ts-utils'
import type { CommonProps } from '@/core/tw/components/lib/common-props'
import { normalizePropsRnw } from '@/core/tw/components/lib/normalize-props-rnw'

export type ViewPropsWocn = CommonProps<ViewProps, ViewRn>

// export native type for ref
export type ViewRn = ViewComponent & NativeMethods

export const ViewWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <View {...props} />
}
