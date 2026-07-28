import type { SvgIconProps } from '#/core/components/icon'
import type { ClassName } from '#/core/tw/class-name'
import { useTextStyle } from '#/core/tw/components/text-style-context'
import { useRuntimeStyle } from '#/core/tw/lib/use-runtime-style.native'

export const useSvgIconProps = async ({
  size,
  className,
  style,
  ...props
}: SvgIconProps) => {
  const ctx = useTextStyle()
  const styleComposed = await useRuntimeStyle([
    ctx,
    className,
    style as ClassName,
  ])
  const width = size || styleComposed?.fontSize || 24
  const height = size || styleComposed?.lineHeight || width

  return {
    ...props,
    style: styleComposed,
    width,
    height,
  }
}
