import { omitRnwProps } from 'rntwsc/tw/components/lib/common-props'
import { dataSetProps } from 'rntwsc/tw/components/lib/data-set-props'
import { omit } from 'rntwsc/libs/lodash'
import type { StrMap } from 'rntwsc/libs/utility-types'

export const normalizePropsRnw = (props: StrMap): any => {
  props = omit(props, omitRnwProps)
  props = dataSetProps(props)
  return props
}
