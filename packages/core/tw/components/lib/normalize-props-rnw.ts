import { omit } from '@/core/lodash'
import type { StrMap } from '@/core/ts-utils'
import { omitRnwProps } from '@/core/tw/components/lib/common-props'
import { dataSetProps } from '@/core/tw/components/lib/data-set-props'

export const normalizePropsRnw = (props: StrMap): any => {
  props = omit(props, omitRnwProps)
  props = dataSetProps(props)
  return props
}
