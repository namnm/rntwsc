/* eslint-disable no-restricted-imports */

import type { FlatListComponent, FlatListProps } from 'react-native'
import { FlatList } from 'react-native'

import type { CommonProps } from 'rntwsc/tw/components/lib/common-props'
import { normalizePropsRnw } from 'rntwsc/tw/components/lib/normalize-props-rnw'

export type FlatListPropsWocn<T = any> = CommonProps<
  FlatListProps<T>,
  FlatListRn<T, FlatListProps<T>>
>

// export native type for ref
export type FlatListRn<T = any, Props = any> = FlatListComponent<T, Props>

export const FlatListWocn = (props: any) => {
  props = normalizePropsRnw(props)
  return <FlatList {...props} />
}
