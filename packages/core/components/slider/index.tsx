'use client'

import { useState } from 'react'
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native'

import type { ViewProps } from '#/core/tw/components/view'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'
import { useControllableState } from '#/libs/hooks'
import type { ValueProps } from '#/libs/utility-types'

// ---------------------------------------------
// cva
// ---------------------------------------------

// The container height matches the thumb size per tier, and the track's
// negative top margin re-centers the thinner track bar inside it - both are
// static per size, so only the thumb/indicator's horizontal position needs a
// dynamic inline style below.
const sliderCva = cva({
  classNames: {
    container: 'relative w-full justify-center',
    track:
      'absolute inset-x-0 top-1/2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700',
    indicator: 'h-full rounded-full',
    thumb:
      'absolute top-0 rounded-full border-2 border-white shadow dark:border-gray-900',
  },
  attributes: {
    size: {
      sm: {
        container: 'h-3.5',
        track: '-mt-[5px] h-1',
        thumb: '-ml-[7px] h-3.5 w-3.5',
      },
      md: {
        container: 'h-4',
        track: '-mt-[5px] h-1.5',
        thumb: '-ml-2 h-4 w-4',
      },
      lg: {
        container: 'h-5',
        track: '-mt-1.5 h-2',
        thumb: '-ml-2.5 h-5 w-5',
      },
    },
    type: {
      basic: {
        indicator: 'bg-gray-800 dark:bg-white',
        thumb: 'bg-gray-800 dark:bg-white',
      },
      primary: {
        indicator: 'bg-primary',
        thumb: 'bg-primary',
      },
      secondary: {
        indicator: 'bg-secondary',
        thumb: 'bg-secondary',
      },
      info: {
        indicator: 'bg-info',
        thumb: 'bg-info',
      },
      success: {
        indicator: 'bg-success',
        thumb: 'bg-success',
      },
      warning: {
        indicator: 'bg-warning',
        thumb: 'bg-warning',
      },
      error: {
        indicator: 'bg-error',
        thumb: 'bg-error',
      },
    },
    disabled: {
      true: {
        container: 'opacity-50',
      },
    },
  },
})

// ---------------------------------------------
// pure position -> value math, extracted for testing without needing a
// real DOM layout to drive the responder events
// ---------------------------------------------

export type ComputeSliderValueArgs = {
  locationX: number
  trackWidth: number
  min: number
  max: number
  step?: number
}

export const computeSliderValue = ({
  locationX,
  trackWidth,
  min,
  max,
  step,
}: ComputeSliderValueArgs): number => {
  if (!trackWidth) {
    return min
  }
  const ratio = Math.min(1, Math.max(0, locationX / trackWidth))
  let next = min + ratio * (max - min)
  if (step) {
    next = Math.round(next / step) * step
  }
  return Math.min(max, Math.max(min, next))
}

// ---------------------------------------------
// Slider
// ---------------------------------------------

export type SliderProps = Omit<ViewProps, 'children' | 'onLayout'> &
  ValueProps<number> &
  Pick<Variant<typeof sliderCva>, 'size' | 'type'> & {
    min?: number
    max?: number
    step?: number
    disabled?: boolean
  }

export const Slider = ({
  size = 'md',
  type = 'primary',
  min = 0,
  max = 100,
  step,
  disabled,
  value,
  defaultValue,
  onChange,
  className,
  ...props
}: SliderProps) => {
  const [state, setState] = useControllableState({
    value,
    defaultValue: defaultValue ?? min,
    onChange,
  })
  const [trackWidth, setTrackWidth] = useState(0)

  const cn = sliderCva({
    size,
    type,
    disabled,
  })

  const pct = Math.min(100, Math.max(0, ((state - min) / (max - min)) * 100))

  const onLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width)
  }

  const updateFromLocationX = (locationX: number) => {
    if (disabled || !trackWidth) {
      return
    }
    setState(
      computeSliderValue({
        locationX,
        trackWidth,
        min,
        max,
        step,
      }),
    )
  }

  return (
    <View
      {...props}
      onLayout={onLayout}
      onStartShouldSetResponder={disabled ? undefined : () => true}
      onResponderGrant={(e: GestureResponderEvent) =>
        updateFromLocationX(e.nativeEvent.locationX)
      }
      onResponderMove={(e: GestureResponderEvent) =>
        updateFromLocationX(e.nativeEvent.locationX)
      }
      accessibilityRole='adjustable'
      accessibilityValue={{
        min,
        max,
        now: state,
      }}
      className={[cn.container, className]}
    >
      <View className={cn.track}>
        <View
          className={cn.indicator}
          style={{
            width: `${pct}%`,
          }}
        />
      </View>
      <View
        className={cn.thumb}
        style={{
          left: `${pct}%`,
        }}
      />
    </View>
  )
}
