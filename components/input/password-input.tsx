'use client'

import { useState } from 'react'

import type { TextInputProps } from 'rntwsc/components/input'
import { TextInput } from 'rntwsc/components/input'
import { Eye } from 'rntwsc/icons/eye'
import { EyeSlash } from 'rntwsc/icons/eye-slash'

export type PasswordInputProps = TextInputProps

export const PasswordInput = (props: PasswordInputProps) => {
  const [secureText, setSecureText] = useState(true)
  const SuffixIcon = secureText ? EyeSlash : Eye

  return (
    <TextInput
      {...props}
      secureTextEntry={secureText}
      suffix={<SuffixIcon className='text-md' />}
      onSuffixPress={() => setSecureText(prev => !prev)}
    />
  )
}
