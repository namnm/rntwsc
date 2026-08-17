// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { useDebouncedValue } from '#/libs/hooks/use-debounced-value'

afterEach(() => {
  vi.useRealTimers()
})

describe('useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300))
    expect(result.current).toBe('a')
  })

  it('only commits the new value after the delay elapses', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: {
          value: 'a',
        },
      },
    )
    rerender({
      value: 'b',
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(299)
    })
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b')
  })

  it('resets the timer on a rapid second change - only the last value ever commits', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 300),
      {
        initialProps: {
          value: 'a',
        },
      },
    )
    rerender({
      value: 'b',
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    rerender({
      value: 'c',
    })
    act(() => {
      vi.advanceTimersByTime(200)
    })
    // 'b' never gets a full 300ms window before 'c' superseded it
    expect(result.current).toBe('a')

    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(result.current).toBe('c')
  })

  it('applies immediately with no timer when delayMs is 0 or less', () => {
    vi.useFakeTimers()
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 0),
      {
        initialProps: {
          value: 'a',
        },
      },
    )
    rerender({
      value: 'b',
    })
    expect(result.current).toBe('b')
  })
})
