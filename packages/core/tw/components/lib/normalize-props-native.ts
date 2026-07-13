import { omitNativeProps } from '@/core/tw/components/lib/common-props'
import { styleToProps } from '@/core/tw/components/lib/style-to-props'
import { omitBy } from '@/libs/lodash'
import type { StrMap } from '@/libs/utility-types'

export const normalizePropsNative = (
  props: StrMap,
  styleProps?: string[],
): any => {
  props = omitBy(props, omitNativeProps)
  props = styleToProps(props, styleProps)
  return props
}
