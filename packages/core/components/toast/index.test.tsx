// @vitest-environment jsdom
import { act, fireEvent, render, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

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
})
