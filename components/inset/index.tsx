import { insetShadowClassName } from 'rntwsc/components/inset/inset'
import type { ClassName } from 'rntwsc/tw/class-name'
import { View } from 'rntwsc/tw/components/view'

export type InsetShadowProps = {
  enabled?: boolean
  className?: ClassName
}

export const InsetShadow = ({ enabled, className }: InsetShadowProps) => (
  <View
    className={[
      'pointer-events-none absolute inset-[-2px] opacity-0 transition',
      enabled && 'opacity-100',
      insetShadowClassName,
      className,
    ]}
  />
)
