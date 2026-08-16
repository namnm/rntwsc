import type { ViewProps } from '#/core/tw/components/view'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'

const progressCva = cva({
  classNames: {
    track: 'w-full overflow-hidden bg-gray-100 dark:bg-gray-700',
    indicator: 'h-full transition-[width]',
  },
  attributes: {
    size: {
      sm: {
        track: 'h-1.5',
      },
      md: {
        track: 'h-2.5',
      },
      lg: {
        track: 'h-4',
      },
    },
    shape: {
      rounded: {
        track: 'rounded-md',
        indicator: 'rounded-md',
      },
      pill: {
        track: 'rounded-full',
        indicator: 'rounded-full',
      },
    },
    type: {
      basic: {
        indicator: 'bg-gray-800 dark:bg-white',
      },
      primary: {
        indicator: 'bg-primary',
      },
      secondary: {
        indicator: 'bg-secondary',
      },
      info: {
        indicator: 'bg-info',
      },
      success: {
        indicator: 'bg-success',
      },
      warning: {
        indicator: 'bg-warning',
      },
      error: {
        indicator: 'bg-error',
      },
    },
  },
})

export type ProgressProps = Omit<ViewProps, 'children'> &
  Variant<typeof progressCva> & {
    value: number
    max?: number
  }

export const Progress = ({
  value,
  max = 100,
  size = 'md',
  shape = 'rounded',
  type = 'primary',
  className,
  ...props
}: ProgressProps) => {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const cn = progressCva({
    size,
    shape,
    type,
  })

  return (
    <View
      {...props}
      accessibilityRole='progressbar'
      accessibilityValue={{
        min: 0,
        max,
        now: value,
      }}
      className={[cn.track, className]}
    >
      <View
        className={cn.indicator}
        style={{
          width: `${pct}%`,
        }}
      />
    </View>
  )
}
