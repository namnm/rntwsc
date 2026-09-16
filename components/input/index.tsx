'use client'

import type { ReactNode } from 'react'

import { inputCva } from 'rntwsc/components/input/input-cva'
import { useIsRtl } from 'rntwsc/i18n/use-is-rtl'
import type { ClassName } from 'rntwsc/tw/class-name'
import { clsx } from 'rntwsc/tw/clsx'
import type { InputProps } from 'rntwsc/tw/components/input'
import { Input } from 'rntwsc/tw/components/input'
import type { PressableProps } from 'rntwsc/tw/components/pressable'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { TextStyleProvider } from 'rntwsc/tw/components/text-style-context'
import { View } from 'rntwsc/tw/components/view'
import type { Variant } from 'rntwsc/tw/cva'
import { cva } from 'rntwsc/tw/cva'

// Border/background/shape/invalid colors come from the shared inputCva
// (same one Select/DatePicker/Combobox's trigger uses) so they can't drift
// out of sync again - this local cva only covers what's specific to a real
// <input>: text sizing/padding, the icon/slot affix sizing, and the
// prefix/suffix padding compounds.
const classNames = cva({
  classNames: {
    input:
      'w-full py-0 text-black placeholder-gray-300 transition-colors dark:text-white',
    icon: '',
    slot: '',
  },
  attributes: {
    size: {
      sm: {
        input: 'h-7 px-2 text-xs',
        icon: 'text-xs',
        slot: 'w-6',
      },
      md: {
        input: 'h-9 px-2.5 py-2 text-sm',
        icon: 'text-sm',
        slot: 'w-7',
      },
      lg: {
        input: 'text-md h-11 px-3',
        icon: 'text-md',
        slot: 'w-8',
      },
    },
    prefix: {
      true: {},
    },
    suffix: {
      true: {},
    },
    rtl: {
      true: {},
    },
  },
  compoundVariants: [
    // ========================================================================
    // prefix / suffix padding
    // prefix sits at the reading-start side, suffix at the reading-end side
    // (left/right in ltr, mirrored in rtl)
    {
      prefix: true,
      rtl: false,
      size: 'sm',
      classNames: {
        input: 'pl-6',
      },
    },
    {
      prefix: true,
      rtl: false,
      size: 'md',
      classNames: {
        input: 'pl-7',
      },
    },
    {
      prefix: true,
      rtl: false,
      size: 'lg',
      classNames: {
        input: 'pl-8',
      },
    },
    {
      prefix: true,
      rtl: true,
      size: 'sm',
      classNames: {
        input: 'pr-6',
      },
    },
    {
      prefix: true,
      rtl: true,
      size: 'md',
      classNames: {
        input: 'pr-7',
      },
    },
    {
      prefix: true,
      rtl: true,
      size: 'lg',
      classNames: {
        input: 'pr-8',
      },
    },
    {
      suffix: true,
      rtl: false,
      size: 'sm',
      classNames: {
        input: 'pr-6',
      },
    },
    {
      suffix: true,
      rtl: false,
      size: 'md',
      classNames: {
        input: 'pr-7',
      },
    },
    {
      suffix: true,
      rtl: false,
      size: 'lg',
      classNames: {
        input: 'pr-8',
      },
    },
    {
      suffix: true,
      rtl: true,
      size: 'sm',
      classNames: {
        input: 'pl-6',
      },
    },
    {
      suffix: true,
      rtl: true,
      size: 'md',
      classNames: {
        input: 'pl-7',
      },
    },
    {
      suffix: true,
      rtl: true,
      size: 'lg',
      classNames: {
        input: 'pl-8',
      },
    },
  ],
})

export type TextInputProps = Omit<
  Variant<typeof classNames>,
  'prefix' | 'suffix' | 'rtl'
> &
  Pick<Variant<typeof inputCva>, 'appearance' | 'shape' | 'invalid'> &
  InputProps & {
    prefix?: ((cn: ClassName) => ReactNode) | ReactNode
    suffix?: ((cn: ClassName) => ReactNode) | ReactNode
    onPrefixPress?: PressableProps['onPress']
    onSuffixPress?: PressableProps['onPress']
    containerClassName?: ClassName
    disabled?: boolean
  }

export const TextInput = async ({
  appearance = 'outlined',
  size = 'md',
  shape = 'rounded',
  invalid,
  prefix,
  suffix,
  onPrefixPress,
  onSuffixPress,
  containerClassName,
  disabled,
  ...props
}: TextInputProps) => {
  const rtl = await useIsRtl()

  const fieldCn = inputCva({
    appearance,
    size,
    shape,
    invalid,
  })
  const cn = classNames({
    size,
    prefix: !!prefix,
    suffix: !!suffix,
    rtl,
  })

  // prefix sits at the reading-start side, suffix at the reading-end side
  const renderAffix = (
    affix: TextInputProps['prefix'],
    position: 'start' | 'end',
    onPress?: TextInputProps['onPrefixPress'],
  ) => {
    if (!affix) {
      return null
    }

    const atLeft = rtl ? position === 'end' : position === 'start'
    const baseClass = clsx([
      cn.slot,
      'absolute inset-y-0 z-10 shrink-0 items-center justify-center p-0',
      atLeft ? 'left-0' : 'right-0',
    ])

    if (typeof affix === 'function') {
      return affix(baseClass)
    }

    return (
      <Pressable
        onPress={onPress}
        className={[baseClass, !onPress && 'pointer-events-none']}
      >
        <TextStyleProvider className={cn.icon}>{affix}</TextStyleProvider>
      </Pressable>
    )
  }

  return (
    <View className={['relative w-full self-start', containerClassName]}>
      {renderAffix(prefix, 'start', onPrefixPress)}
      <Input
        {...props}
        editable={disabled ? false : props.editable}
        className={[
          fieldCn.container,
          cn.input,
          disabled && 'cursor-not-allowed',
          props.className,
        ]}
      />
      {renderAffix(suffix, 'end', onSuffixPress)}
    </View>
  )
}
