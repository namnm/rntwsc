// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  pauseToast,
  removeToast,
  resumeToast,
  toast,
  useToastItems,
} from '#/core/components/toast/store'

// itemsStore/listenersStore/timeoutsStore live on globalThis (see
// global-store.ts), so state persists across tests - always leave it empty.
afterEach(() => {
  const { result } = renderHook(() => useToastItems())
  for (const item of result.current) {
    act(() => removeToast(item.id))
  }
  vi.useRealTimers()
})

describe('toast store', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => useToastItems())
    expect(result.current).toEqual([])
  })

  it('toast() adds an item with the given type/message', () => {
    const { result } = renderHook(() => useToastItems())
    act(() => {
      toast({
        type: 'success',
        message: 'Saved',
      })
    })
    expect(result.current).toHaveLength(1)
    expect(result.current[0].type).toBe('success')
    expect(result.current[0].message).toBe('Saved')
  })

  it('defaults to type "basic" and a 4000ms duration', () => {
    const { result } = renderHook(() => useToastItems())
    act(() => {
      toast({
        message: 'Hi',
      })
    })
    expect(result.current[0].type).toBe('basic')
    expect(result.current[0].duration).toBe(4000)
  })

  it('auto-removes the item after its duration elapses', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToastItems())
    act(() => {
      toast({
        message: 'Hi',
        duration: 1000,
      })
    })
    expect(result.current).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toHaveLength(0)
  })

  it('removeToast drops the item and clears its pending timeout', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToastItems())
    let id = ''
    act(() => {
      id = toast({
        message: 'Hi',
        duration: 1000,
      })
    })
    act(() => removeToast(id))
    expect(result.current).toHaveLength(0)

    // the cleared timeout must not fire and try to remove it again
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toHaveLength(0)
  })

  it('pauseToast stops the countdown so the item survives past its duration', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToastItems())
    let id = ''
    act(() => {
      id = toast({
        message: 'Hi',
        duration: 1000,
      })
    })
    act(() => {
      vi.advanceTimersByTime(500)
      pauseToast(id)
      vi.advanceTimersByTime(1000)
    })
    expect(result.current).toHaveLength(1)
  })

  it('resumeToast reschedules only the remaining time, not the full duration', () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useToastItems())
    let id = ''
    act(() => {
      id = toast({
        message: 'Hi',
        duration: 1000,
      })
    })
    act(() => {
      // consume 800ms, pause with 200ms remaining, resume
      vi.advanceTimersByTime(800)
      pauseToast(id)
      resumeToast(id)
    })
    act(() => {
      vi.advanceTimersByTime(199)
    })
    expect(result.current).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(result.current).toHaveLength(0)
  })
})
