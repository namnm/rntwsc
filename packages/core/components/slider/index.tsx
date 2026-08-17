'use client'

import type { FC } from 'react'
import { useState } from 'react'
import type {
  AccessibilityActionEvent,
  GestureResponderEvent,
  LayoutChangeEvent,
} from 'react-native'

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
    invalid: {
      true: {
        container: 'ring-error rounded-full ring-2 ring-offset-2',
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
    invalid?: boolean
  }

// tabIndex/onKeyDown are web-only, not part of react-native's own ViewProps -
// widen the type locally instead of typing them onto the shared primitive.
type ViewWithKeyboardProps = ViewProps & {
  tabIndex?: number
  onKeyDown?: (e: KeyboardEvent) => void
}
const ViewFocusable = View as FC<ViewWithKeyboardProps>

export const Slider = ({
  size = 'md',
  type = 'primary',
  min = 0,
  max = 100,
  step,
  disabled,
  invalid,
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
    invalid,
  })

  const pct = Math.min(100, Math.max(0, ((state - min) / (max - min)) * 100))
  // used by both keyboard arrow-key stepping and the increment/decrement
  // accessibility actions when the caller has not set an explicit step
  const stepFor = step || (max - min) / 10 || 1

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

  const onAccessibilityAction = (e: AccessibilityActionEvent) => {
    if (disabled) {
      return
    }
    if (e.nativeEvent.actionName === 'increment') {
      setState(Math.min(max, state + stepFor))
    } else if (e.nativeEvent.actionName === 'decrement') {
      setState(Math.max(min, state - stepFor))
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (disabled) {
      return
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      e.preventDefault()
      setState(Math.min(max, state + stepFor))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      e.preventDefault()
      setState(Math.max(min, state - stepFor))
    } else if (e.key === 'Home') {
      e.preventDefault()
      setState(min)
    } else if (e.key === 'End') {
      e.preventDefault()
      setState(max)
    }
  }

  return (
    <ViewFocusable
      {...props}
      onLayout={onLayout}
      onStartShouldSetResponder={disabled ? undefined : () => true}
      onResponderGrant={(e: GestureResponderEvent) =>
        updateFromLocationX(e.nativeEvent.locationX)
      }
      onResponderMove={(e: GestureResponderEvent) =>
        updateFromLocationX(e.nativeEvent.locationX)
      }
      onKeyDown={onKeyDown}
      onAccessibilityAction={onAccessibilityAction}
      tabIndex={disabled ? undefined : 0}
      role='slider'
      aria-disabled={disabled}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={state}
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
    </ViewFocusable>
  )
}
