import type { SvgIconProps } from 'rntwsc/components/icon'
import type { ClassName } from 'rntwsc/tw/class-name'
import { clsx } from 'rntwsc/tw/clsx'
import { useTextStyle } from 'rntwsc/tw/components/text-style-context'
import { runtimeStyle } from 'rntwsc/tw/runtime-style'

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
