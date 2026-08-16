'use client'

// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import {
  useIsMounted,
  useOnMounted,
  useOnUnmounted,
} from '#/libs/hooks/use-mounted'

describe('useIsMounted', () => {
  it('starts false and becomes true after the effect runs', () => {
    const { result } = renderHook(() => useIsMounted())
    expect(result.current).toBe(true)
  })
})

describe('useOnMounted', () => {
  it('calls the callback once on mount', () => {
    const fn = vi.fn()
    renderHook(() => useOnMounted(fn))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('calls the cleanup function returned by the callback on unmount', () => {
    const cleanup = vi.fn()
    const fn = vi.fn(() => cleanup)
    const { unmount } = renderHook(() => useOnMounted(fn))
    expect(cleanup).not.toHaveBeenCalled()
    act(() => unmount())
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('does not re-run when the hosting component re-renders', () => {
    const fn = vi.fn()
    const { rerender } = renderHook(() => useOnMounted(fn))
    rerender()
    rerender()
    expect(fn).toHaveBeenCalledTimes(1)
  })
})

describe('useOnUnmounted', () => {
  it('does not call the callback on mount', () => {
    const fn = vi.fn()
    renderHook(() => useOnUnmounted(fn))
    expect(fn).not.toHaveBeenCalled()
  })

  it('calls the callback exactly once on unmount', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useOnUnmounted(fn))
    act(() => unmount())
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
