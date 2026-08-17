'use client'

import type { NumberInputProps } from '#/core/components/input/number-input'
import { NumberInput } from '#/core/components/input/number-input'
import { useIsRtl } from '#/core/i18n/use-is-rtl'
import { Minus } from '#/core/icons/minus'
import { Plus } from '#/core/icons/plus'
import { Pressable } from '#/core/tw/components/pressable'
import { useControllableState } from '#/libs/hooks'

type QuantityInputProps = NumberInputProps & {
  step?: number
  min?: number
  max?: number
}

export const QuantityInput = async ({
  value,
  defaultValue,
  onChangeText,
  step = 1,
  min = 1,
  max = Infinity,
  ...props
}: QuantityInputProps) => {
  const rtl = await useIsRtl()
  const [state, setState] = useControllableState({
    value,
    defaultValue,
    onChange: onChangeText,
  })

  const clamp = (val: number) =>
    Math.max(min, Math.min(Number.isNaN(val) ? min : val, max)).toString()

  const onPress = (by: number) => {
    setState(prev => clamp(+prev + by))
  }

  return (
    <NumberInput
      {...props}
      value={state}
      onChangeText={setState}
      onBlur={e => {
        setState(prev => clamp(+prev))
        props.onBlur?.(e)
      }}
      className={[
        'border-gray-200 text-center focus:border-gray-200',
        props.className,
      ]}
      prefix={className => (
        <Pressable
          className={[
            className,
            rtl ? 'border-l border-gray-200' : 'border-r border-gray-200',
          ]}
          onPress={() => onPress(-step)}
        >
          <Minus className='text-[10px]' />
        </Pressable>
      )}
      suffix={className => (
        <Pressable
          className={[
            className,
            rtl ? 'border-r border-gray-200' : 'border-l border-gray-200',
          ]}
          onPress={() => onPress(step)}
        >
          <Plus className='text-[10px]' />
        </Pressable>
      )}
    />
  )
}
