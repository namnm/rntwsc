'use client'

import { createContext } from 'react'

import type { ButtonProps } from 'rntwsc/components/button'
import { Button } from 'rntwsc/components/button'
import type { ViewProps } from 'rntwsc/tw/components/view'
import { View } from 'rntwsc/tw/components/view'
import { useSafeContext } from 'rntwsc/libs/hooks'

// ---------------------------------------------
// FormContext
// ---------------------------------------------

type FormContextType = {
  onSubmit?: () => void
  // store form status? loading, disabled, error?
}

const FormContext = createContext<FormContextType | undefined>(undefined)

const useFormContext = () => useSafeContext(FormContext)

// ---------------------------------------------
// Form
// ---------------------------------------------

type FormProps = ViewProps & FormContextType

const Form = ({ onSubmit, ...props }: FormProps) => (
  <FormContext.Provider
    value={{
      onSubmit,
    }}
  >
    <View {...props} />
  </FormContext.Provider>
)

// ---------------------------------------------
// FormTrigger
// ---------------------------------------------

type FormTriggerProps = ButtonProps

const FormTrigger = ({ onPress, ...props }: FormTriggerProps) => {
  const { onSubmit } = useFormContext()

  return (
    <Button
      onPress={e => {
        onPress?.(e)
        e?.preventDefault()
        onSubmit?.()
      }}
      {...props}
    />
  )
}

// ---------------------------------------------
// Exports
// ---------------------------------------------

export { Form, FormTrigger }
export type { FormProps, FormTriggerProps }
