'use client'

import type { TextInputProps } from '#/core/components/input'
import { TextInput } from '#/core/components/input'

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
