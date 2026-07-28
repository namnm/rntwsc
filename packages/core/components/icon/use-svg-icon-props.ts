import type { SvgIconProps } from '#/core/components/icon'
import type { ClassName } from '#/core/tw/class-name'
import { clsx } from '#/core/tw/clsx'
import { useTextStyle } from '#/core/tw/components/text-style-context'
import { runtimeStyle } from '#/core/tw/runtime-style'

export const useSvgIconProps = ({
  size,
  className,
  style,
  ...props
}: SvgIconProps) => {
  const ctx = useTextStyle()
  const classNameComposed = clsx(ctx, className)
  const styleComposed = runtimeStyle([classNameComposed, style as ClassName])
  const width = size || styleComposed?.fontSize || 24
  const height = size || styleComposed?.lineHeight || width

  return {
    ...props,
    className: classNameComposed,
    width,
    height,
  }
}
