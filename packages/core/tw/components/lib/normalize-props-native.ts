import { omitBy } from '@/core/lodash'
import type { StrMap } from '@/core/ts-utils'
import { omitNativeProps } from '@/core/tw/components/lib/common-props'
import { styleToProps } from '@/core/tw/components/lib/style-to-props'

export const normalizePropsNative = (
  props: StrMap,
  styleProps?: string[],
): any => {
  props = omitBy(props, omitNativeProps)
  props = styleToProps(props, styleProps)
  return props
}
