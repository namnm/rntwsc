'use client'

import type { ReactNode } from 'react'

import { useIsRtl } from '#/core/i18n/use-is-rtl'
import type { ClassName } from '#/core/tw/class-name'
import { clsx } from '#/core/tw/clsx'
import type { InputProps } from '#/core/tw/components/input'
import { Input } from '#/core/tw/components/input'
import type { PressableProps } from '#/core/tw/components/pressable'
import { Pressable } from '#/core/tw/components/pressable'
import { TextStyleProvider } from '#/core/tw/components/text-style-context'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'

const classNames = cva({
  classNames: {
    input:
      'w-full py-0 text-black placeholder-gray-300 transition-colors dark:text-white',
    icon: '',
    slot: '',
  },
  attributes: {
    appearance: {
      outlined: {
        input:
          'border border-gray-200 bg-white focus:border-black dark:border-gray-700 dark:bg-black dark:focus:border-white',
      },
      filled: {
        input:
          'border border-transparent bg-gray-100 focus:border-gray-300 dark:bg-gray-800 dark:focus:border-gray-600',
      },
      ghost: {
        input:
          'border border-transparent bg-transparent focus:border-gray-300 dark:focus:border-gray-600',
      },
      underlined: {
        input:
          'border border-transparent border-b-gray-200 bg-transparent focus:border-b-black dark:border-b-gray-700 dark:focus:border-b-white',
      },
    },
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
    shape: {
      none: {
        input: 'rounded-none',
      },
      rounded: {
        input: 'rounded-md',
      },
      pill: {
        input: 'rounded-full',
      },
    },
    invalid: {
      true: {},
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
    // invalid
    {
      appearance: 'outlined',
      invalid: true,
      classNames: {
        input: 'border-error focus:border-error',
      },
    },
    {
      appearance: 'filled',
      invalid: true,
      classNames: {
        input: 'border-error focus:border-error',
      },
    },
    {
      appearance: 'ghost',
      invalid: true,
      classNames: {
        input: 'border-error focus:border-error',
      },
    },
    {
      appearance: 'underlined',
      invalid: true,
      classNames: {
        input: 'border-b-error focus:border-b-error',
      },
    },
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

  const cn = classNames({
    appearance,
    size,
    shape,
    invalid,
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
          cn.input,
          disabled && 'cursor-not-allowed',
          props.className,
        ]}
      />
      {renderAffix(suffix, 'end', onSuffixPress)}
    </View>
  )
}
