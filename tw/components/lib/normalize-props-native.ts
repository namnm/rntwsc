import { omitNativeProps } from 'rntwsc/tw/components/lib/common-props'
import { styleToProps } from 'rntwsc/tw/components/lib/style-to-props'
import { omitBy } from 'rntwsc/libs/lodash'
import type { StrMap } from 'rntwsc/libs/utility-types'

export const normalizePropsNative = (
  props: StrMap,
  styleProps?: string[],
): any => {
  props = omitBy(props, omitNativeProps)
  props = styleToProps(props, styleProps)
  return props
}
