import type { ReactElement, ReactNode } from 'react'
import { isValidElement } from 'react'

import type { ClassName } from '@/core/tw/class-name'
import { clsx } from '@/core/tw/clsx'
import type { StrMap } from '@/shared/ts-utils'

export type AnyProps = StrMap<unknown>

export const SLOTTABLE_TYPE = Symbol('Slottable')

export const isSlottable = (node: ReactNode): node is ReactElement =>
  isValidElement(node) &&
  (node.type as unknown as { $$typeof?: symbol }).$$typeof === SLOTTABLE_TYPE

export const mergeProps = (
  slotProps: AnyProps,
  childProps: AnyProps,
): AnyProps => {
  const merged: AnyProps = {
    ...slotProps,
  }

  for (const key of Object.keys(childProps)) {
    const slotVal = slotProps[key]
    const childVal = childProps[key]

    // Event handlers — chain both, child last
    if (
      typeof slotVal === 'function' &&
      typeof childVal === 'function' &&
      /^on[A-Z]/.test(key)
    ) {
      merged[key] = (...args: unknown[]) => {
        childVal(...args)
        slotVal(...args)
      }
      continue
    }

    // className — space-join (web)
    if (key === 'className') {
      // merged[key] = [slotVal, childVal].filter(Boolean).join(' ') || undefined
      merged[key] = clsx(slotVal as ClassName, childVal as ClassName)
      continue
    }

    // style — merge objects (works for both CSSProperties and RN StyleSheet)
    if (key === 'style') {
      if (slotVal || childVal) {
        // Flatten arrays (React Native allows style arrays)
        const flatSlot = flattenStyle(slotVal)
        const flatChild = flattenStyle(childVal)
        merged[key] = {
          ...flatSlot,
          ...flatChild,
        }
      }
      continue
    }

    // Default — child wins
    merged[key] = childVal
  }

  return merged
}

export const flattenStyle = (style: unknown): StrMap<unknown> => {
  if (!style) {
    return {}
  }
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle))
  }
  if (typeof style === 'object') {
    return style as StrMap<unknown>
  }
  return {}
}
