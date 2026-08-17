// @vitest-environment jsdom
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Portal } from '#/core/components/portal'
import { Toast } from '#/core/components/toast'
import {
  removeToast,
  toast,
  useToastItems,
} from '#/core/components/toast/store'

const withPortalRoot = (children: ReactNode) => (
  <div>
    {children}
    <Portal.Root />
  </div>
)

afterEach(() => {
  const { result } = renderHook(() => useToastItems())
  for (const item of result.current) {
    act(() => removeToast(item.id))
  }
})

describe('Toast', () => {
  it('renders nothing when there are no queued toasts', () => {
    const { container } = render(withPortalRoot(<Toast />))
    expect(container.textContent).toBe('')
  })

  it('renders a queued toast message', () => {
    const { getByText } = render(withPortalRoot(<Toast />))
    act(() => {
      toast({
        message: 'Saved successfully',
      })
    })
    expect(getByText('Saved successfully')).toBeTruthy()
  })

  it('dismisses a toast when pressed', () => {
    const { getByText, queryByText } = render(withPortalRoot(<Toast />))
    act(() => {
      toast({
        message: 'Tap to dismiss',
      })
    })
    fireEvent.click(getByText('Tap to dismiss'))
    expect(queryByText('Tap to dismiss')).toBeNull()
  })

  it('exposes status role and aria-live', () => {
    const { getByText } = render(withPortalRoot(<Toast />))
    act(() => {
      toast({
        type: 'error',
        message: 'Something failed',
      })
    })
    const el = getByText('Something failed').closest('[role="status"]')
    expect(el?.getAttribute('aria-live')).toBe('assertive')
  })

  it('does not auto-dismiss while hovered, resumes after', () => {
    vi.useFakeTimers()
    const { getByText, queryByText } = render(withPortalRoot(<Toast />))
    act(() => {
      toast({
        message: 'Hover me',
        duration: 1000,
      })
    })
    const el = getByText('Hover me').closest('[role="status"]')!

    act(() => {
      vi.advanceTimersByTime(500)
      fireEvent.pointerEnter(el)
      vi.advanceTimersByTime(2000)
    })
    expect(queryByText('Hover me')).toBeTruthy()

    act(() => {
      fireEvent.pointerLeave(el)
      vi.advanceTimersByTime(500)
    })
    expect(queryByText('Hover me')).toBeNull()
    vi.useRealTimers()
  })
})
