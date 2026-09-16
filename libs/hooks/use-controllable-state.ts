'use client'

import { useCallback, useRef, useState } from 'react'

import type { ValueProps } from 'rntwsc/libs/utility-types'

export const useControllableState = <T>({
  value,
  defaultValue,
  onChange,
}: ValueProps<T>) => {
  const [uncontrolledState, setUncontrolledState] = useState<T | undefined>(
    defaultValue,
  )

  const isControlled = value !== undefined
  const controlledRef = useRef(isControlled)

  if (process.env.NODE_ENV !== 'production') {
    if (controlledRef.current !== isControlled) {
      const fr = controlledRef.current ? 'controlled' : 'uncontrolled'
      const to = isControlled ? 'controlled' : 'uncontrolled'
      console.error(
        `useControllableState: component switched from ${fr} to ${to} mode`,
      )
      controlledRef.current = isControlled
    }
  }

  const state = isControlled ? value : uncontrolledState

  const stateRef = useRef(state)
  stateRef.current = state

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const setState = useCallback(
    (v: T | ((prev: T) => T)) => {
      const nextValue =
        typeof v === 'function'
          ? (v as (prev: T) => T)(stateRef.current as T)
          : v

      if (!isControlled) {
        setUncontrolledState(nextValue)
      }
      onChangeRef.current?.(nextValue)
    },
    [isControlled],
  )

  return [state as T, setState] as const
}
