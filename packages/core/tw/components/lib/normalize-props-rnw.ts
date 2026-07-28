import { omitRnwProps } from '#/core/tw/components/lib/common-props'
import { dataSetProps } from '#/core/tw/components/lib/data-set-props'
import { omit } from '#/libs/lodash'
import type { StrMap } from '#/libs/utility-types'

export const normalizePropsRnw = (props: StrMap): any => {
  props = omit(props, omitRnwProps)
  props = dataSetProps(props)
  return props
}
