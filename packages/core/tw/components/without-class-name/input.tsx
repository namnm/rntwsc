/* eslint-disable no-restricted-imports */

import type {
  NativeMethods,
  TextInputComponent,
  TextInputProps,
} from 'react-native'
import { TextInput } from 'react-native'

import type { CommonProps } from '#/core/tw/components/lib/common-props'
import { normalizePropsRnw } from '#/core/tw/components/lib/normalize-props-rnw'
import type { StrMap } from '#/libs/utility-types'

export type InputPropsWocn = CommonProps<
  Omit<
    TextInputProps,
    // should be supported using class name in native
    'placeholderTextColor' | 'caretHidden'
  >,
  InputRn
>

// export native type for ref
export type InputRn = TextInputComponent & NativeMethods

export const InputWocn = (props: StrMap) => {
  props = normalizePropsRnw(props)
  return <TextInput {...props} />
}
