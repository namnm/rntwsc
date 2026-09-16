import type { ReactElement, ReactNode } from 'react'
import { isValidElement } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import { clsx } from 'rntwsc/tw/clsx'
import type { StrMap } from 'rntwsc/libs/utility-types'

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

  // className - always run through clsx, even when only one side defines
  // it, since slotProps.className can be a ClassName array (e.g. Button's
  // own [cn.button, pressing && cn.buttonActive, className]) that must be
  // flattened/merged rather than passed straight to a DOM className prop.
  if ('className' in slotProps || 'className' in childProps) {
    merged.className = clsx(
      slotProps.className as ClassName,
      childProps.className as ClassName,
    )
  }

  for (const key of Object.keys(childProps)) {
    if (key === 'className') {
      continue
    }

    const slotVal = slotProps[key]
    const childVal = childProps[key]

    // Event handlers - chain both, child last
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

    // style - merge objects, works for both CSSProperties and RN StyleSheet
    if (key === 'style') {
      if (slotVal || childVal) {
        // React Native allows style arrays, so flatten before merging
        const flatSlot = flattenStyle(slotVal)
        const flatChild = flattenStyle(childVal)
        merged[key] = {
          ...flatSlot,
          ...flatChild,
        }
      }
      continue
    }

    // Default - child wins
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
