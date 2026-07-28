'use client'

import type { ReactElement } from 'react'
import { Children, cloneElement } from 'react'

import type { ButtonProps } from '#/core/components/button'
import { groupOverlapClassName } from '#/core/components/button/group-overlap-class-name'
import { useIsRtl } from '#/core/i18n/use-is-rtl'
import { View } from '#/core/tw/components/view'

export type ButtonGroupProps = Pick<
  ButtonProps,
  | 'type'
  | 'appearance'
  | 'size'
  | 'shape'
  | 'inset'
  | 'ripple'
  | 'disabled'
  | 'className'
  | 'children'
>

export const ButtonGroup = async ({
  type = 'primary',
  appearance = 'solid',
  size = 'md',
  shape = 'rounded',
  inset = true,
  ripple = true,
  disabled,
  className,
  children,
}: ButtonGroupProps) => {
  const rtl = await useIsRtl()
  const arr = Children.toArray(children)
  const count = arr.length

  children = arr.map((_c, i) => {
    const c = _c as ReactElement<ButtonProps>
    const isOnlyChild = count === 1
    const isFirst = i === 0
    const isLast = i === count - 1
    const isMiddle = !isFirst && !isLast

    const isOutline = appearance === 'outline'
    const overlapClassName = groupOverlapClassName(isOutline, isFirst, rtl)

    return cloneElement(c, {
      type: c.props.type || type,
      appearance,
      size,
      shape: isOnlyChild || isMiddle ? 'none' : shape,
      groupFirst: !isOnlyChild && isFirst,
      groupLast: !isOnlyChild && isLast,
      elevation: false,
      inset,
      ripple,
      disabled: c.props.disabled || disabled,
      className: [overlapClassName, c.props.className],
    })
  })

  return <View className={['flex-row', className]}>{children}</View>
}
