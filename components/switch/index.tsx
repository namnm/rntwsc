'use client'

import { InsetShadow } from 'rntwsc/components/inset'
import { useIsRtl } from 'rntwsc/i18n/use-is-rtl'
import type { PressableProps } from 'rntwsc/tw/components/pressable'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { View } from 'rntwsc/tw/components/view'
import type { Variant } from 'rntwsc/tw/cva'
import { cva } from 'rntwsc/tw/cva'
import { useControllableState } from 'rntwsc/libs/hooks'
import type { ValueProps } from 'rntwsc/libs/utility-types'

const switchCva = cva({
  classNames: {
    inset: 'rounded-full',
    track: 'flex overflow-hidden rounded-full transition-colors',
    trackOff: 'bg-gray-200 dark:bg-gray-700',
    trackOn: '',
    thumb: 'mt-0.5 rounded-full bg-white shadow-sm transition-transform',
    thumbOff: '',
    thumbOn: '',
  },
  attributes: {
    size: {
      sm: {
        track: 'h-4 w-8',
        thumb: 'h-3 w-3',
        thumbOff: 'translate-x-0.5',
        thumbOn: 'translate-x-4.5',
      },
      md: {
        track: 'h-6 w-11',
        thumb: 'h-5 w-5',
        thumbOff: 'translate-x-0.5',
        thumbOn: 'translate-x-5.5',
      },
      lg: {
        track: 'h-7 w-14',
        thumb: 'h-6 w-6',
        thumbOff: 'translate-x-0.5',
        thumbOn: 'translate-x-7.5',
      },
    },
    type: {
      basic: {},
      primary: {},
      secondary: {},
      info: {},
      success: {},
      warning: {},
      error: {},
    },
    disabled: {
      true: {
        track: 'cursor-not-allowed opacity-50',
      },
    },
    invalid: {
      true: {
        track: 'ring-error ring-2',
      },
    },
  },
  compoundVariants: [
    {
      type: 'basic',
      classNames: {
        trackOn: 'bg-gray-800 dark:bg-white',
      },
    },
    {
      type: 'primary',
      classNames: {
        trackOn: 'bg-primary',
      },
    },
    {
      type: 'secondary',
      classNames: {
        trackOn: 'bg-secondary',
      },
    },
    {
      type: 'info',
      classNames: {
        trackOn: 'bg-info',
      },
    },
    {
      type: 'success',
      classNames: {
        trackOn: 'bg-success',
      },
    },
    {
      type: 'warning',
      classNames: {
        trackOn: 'bg-warning',
      },
    },
    {
      type: 'error',
      classNames: {
        trackOn: 'bg-error',
      },
    },
  ],
})

export type SwitchProps = Omit<PressableProps, 'children' | 'onPress'> &
  Variant<typeof switchCva> &
  ValueProps<boolean>

export const Switch = async ({
  type = 'primary',
  size = 'md',
  disabled,
  invalid,
  value,
  defaultValue = false,
  onChange,
  className,
  ...props
}: SwitchProps) => {
  const rtl = await useIsRtl()
  const [checked, setChecked] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  const cn = switchCva({
    type,
    size,
    disabled,
    invalid,
  })

  // translate-x doesn't mirror under rtl; move the thumb toward the end side
  // manually. See i18n.md#direction-rtl.
  const thumbAtEnd = checked !== rtl

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={() => setChecked(v => !v)}
      role='switch'
      aria-checked={checked}
      className={[cn.track, checked ? cn.trackOn : cn.trackOff, className]}
      // rasterize to fix opacity
      renderToHardwareTextureAndroid={disabled}
      shouldRasterizeIOS={disabled}
    >
      <InsetShadow className={cn.inset} enabled />
      <View className={[cn.thumb, thumbAtEnd ? cn.thumbOn : cn.thumbOff]} />
    </Pressable>
  )
}
