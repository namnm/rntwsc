/* eslint-disable no-restricted-imports */

import type { NativeMethods, TextComponent, TextProps } from 'react-native'
import { Text } from 'react-native'

import type { CommonProps } from 'rntwsc/tw/components/lib/common-props'
import { normalizePropsRnw } from 'rntwsc/tw/components/lib/normalize-props-rnw'
import type { StrMap } from 'rntwsc/libs/utility-types'

export type TextPropsWocn = CommonProps<
  Omit<
    TextProps,
    // should be supported using class name in native
    'numberOfLines' | 'selectable'
  >,
  TextRn
>

// export native type for ref
export type TextRn = TextComponent & NativeMethods

export const TextWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <Text {...props} />
}
