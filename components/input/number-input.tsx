'use client'

import type { TextInputProps } from 'rntwsc/components/input'
import { TextInput } from 'rntwsc/components/input'

export type NumberInputProps = TextInputProps

export const NumberInput = (props: NumberInputProps) => (
  <TextInput
    {...props}
    keyboardType='numeric'
    inputMode='numeric'
    autoCorrect={false}
    autoCapitalize='none'
  />
)
