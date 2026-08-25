'use client'

import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'
import type {
  Control,
  ControllerFieldState,
  ControllerRenderProps,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form'
import { Controller } from 'react-hook-form'

import { Span } from 'rntwsc/components/text'
import type { ViewProps } from 'rntwsc/tw/components/view'
import { View } from 'rntwsc/tw/components/view'
import type { StrMap } from 'rntwsc/libs/utility-types'

type Rules<T extends FieldValues> = Omit<
  RegisterOptions<T, Path<T>>,
  'disabled' | 'valueAsNumber' | 'valueAsDate' | 'setValueAs'
>

type RenderProps<T extends FieldValues, K extends Path<T>> = {
  invalid: boolean
  value: T[K]
  onChange: (value: T[K]) => void
  onBlur: () => void
}

export type FormFieldProps<T extends FieldValues, K extends Path<T>> = Omit<
  ViewProps,
  'children'
> & {
  name: K
  control: Control<T>
  rules?: Rules<T>
  label?: ReactNode | (() => ReactNode)
  requiredMask?: boolean
  valuePropName?: string
  onChangePropName?: string
  children: ReactElement<StrMap> | ((props: RenderProps<T, K>) => ReactElement)
}

export const FormField = <T extends FieldValues, K extends Path<T>>({
  id: propId,
  name,
  control,
  rules,
  label,
  requiredMask,
  valuePropName = 'value',
  onChangePropName,
  children,
  ...props
}: FormFieldProps<T, K>) => {
  const fieldId = propId || name
  const labelId = `${fieldId}-label`
  const errId = `${fieldId}-error`

  const renderLabel = () =>
    label ? (
      <View className='flex-row gap-0.5'>
        <Span
          nativeID={labelId}
          className='text-sm font-medium text-gray-700 transition dark:text-gray-300'
        >
          {typeof label === 'function' ? label() : label}
        </Span>
        {requiredMask && <Span className='text-error text-sm'>*</Span>}
      </View>
    ) : null

  const renderChildren = (
    field: ControllerRenderProps<T, Path<T>>,
    fieldState: ControllerFieldState,
  ) => {
    const invalid = !!fieldState.error

    if (typeof children === 'function') {
      return children({
        invalid,
        value: field.value,
        onChange: field.onChange,
        onBlur: field.onBlur,
      })
    }

    if (isValidElement(children)) {
      // caller did not pick a specific prop name - wire both onChange and
      // onChangeText to the same handler, since a real component only ever
      // defines one of the two (TextInput-family: onChangeText only,
      // ValueProps-based: onChange only), so there is no double-handling risk
      const changePropName = onChangePropName || 'onChange'
      const extraProps: StrMap = {
        invalid,
        'aria-invalid': invalid,
        [valuePropName]: field.value,
        [changePropName]: (e: Parameters<typeof field.onChange>[0]) => {
          field.onChange(e)
          children.props?.[changePropName]?.(e)
        },
        onBlur: () => {
          field.onBlur()
          children.props?.onBlur?.()
        },
      }
      if (!onChangePropName && changePropName !== 'onChangeText') {
        extraProps.onChangeText = (e: Parameters<typeof field.onChange>[0]) => {
          field.onChange(e)
          children.props?.onChangeText?.(e)
        }
      }
      if (label) {
        extraProps['aria-labelledby'] = labelId
      }
      if (invalid) {
        extraProps['aria-describedby'] = errId
      }
      return cloneElement(children, extraProps)
    }

    return null
  }

  const renderErr = ({ error: fieldErr }: ControllerFieldState) =>
    fieldErr?.message ? (
      <Span nativeID={errId} className='text-error text-xs'>
        {fieldErr.message}
      </Span>
    ) : null

  return (
    <Controller
      rules={rules}
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <View {...props}>
          {renderLabel()}
          {renderChildren(field, fieldState)}
          {renderErr(fieldState)}
        </View>
      )}
    />
  )
}
