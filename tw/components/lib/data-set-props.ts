import { dataPrefix } from 'rntwsc/tw/components/lib/common-props'
import { camelCase } from 'rntwsc/libs/lodash'
import type { StrMap } from 'rntwsc/libs/utility-types'

export const dataSetProps = (props: StrMap) => {
  const dataKeys = Object.keys(props).filter(k => k.startsWith(dataPrefix))
  if (!dataKeys.length) {
    return props
  }
  props.dataSet = {}
  for (const k of dataKeys) {
    const camel = camelCase(k.replace(dataPrefix, ''))
    props.dataSet[camel] = props[k]
    delete props[k]
  }
  return props
}
