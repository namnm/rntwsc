import { omitRnwProps } from '@/core/tw/components/lib/common-props'
import { dataSetProps } from '@/core/tw/components/lib/data-set-props'
import { omit } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export const normalizePropsRnw = (props: StrMap): any => {
  props = omit(props, omitRnwProps)
  props = dataSetProps(props)
  return props
}
