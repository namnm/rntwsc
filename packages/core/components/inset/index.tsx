import { insetShadowClassName } from '#/core/components/inset/inset'
import type { ClassName } from '#/core/tw/class-name'
import { View } from '#/core/tw/components/view'

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
