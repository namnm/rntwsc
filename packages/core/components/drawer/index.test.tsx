'use client'

// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Drawer } from '#/core/components/drawer'
import { Portal } from '#/core/components/portal'
import { Span } from '#/core/components/text'

const withPortalRoot = (children: ReactNode) => (
  <div>
    {children}
    <Portal.Root />
  </div>
)

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    const { queryByText } = render(
      withPortalRoot(
        <Drawer open={false} onClose={() => {}}>
          <Span>drawer content</Span>
        </Drawer>,
      ),
    )
    expect(queryByText('drawer content')).toBeNull()
  })

  it('renders its content via Portal when open', () => {
    const { queryByText } = render(
      withPortalRoot(
        <Drawer open onClose={() => {}}>
          <Span>drawer content</Span>
        </Drawer>,
      ),
    )
    expect(queryByText('drawer content')).toBeTruthy()
  })

  it('calls onClose when the backdrop is pressed', () => {
    const onClose = vi.fn()
    render(
      withPortalRoot(
        <Drawer open onClose={onClose}>
          <Span>drawer content</Span>
        </Drawer>,
      ),
    )
    const backdrop = document.body.querySelector('button')!
    fireEvent.click(backdrop)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape', () => {
    const onClose = vi.fn()
    render(
      withPortalRoot(
        <Drawer open onClose={onClose}>
          <Span>drawer content</Span>
        </Drawer>,
      ),
    )
    fireEvent.keyDown(window, {
      key: 'Escape',
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('forwards testID to the panel', () => {
    const { getByTestId } = render(
      withPortalRoot(
        <Drawer open onClose={() => {}} testID='drawer-panel'>
          <Span>drawer content</Span>
        </Drawer>,
      ),
    )
    expect(getByTestId('drawer-panel')).toBeTruthy()
  })
})
