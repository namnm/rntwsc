'use client'

// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Modal } from '#/core/components/modal'
import { Portal } from '#/core/components/portal'
import { Span } from '#/core/components/text'

const withPortalRoot = (children: ReactNode) => (
  <div>
    {children}
    <Portal.Root />
  </div>
)

describe('Modal', () => {
  it('renders nothing when closed by default', () => {
    const { queryByText } = render(
      withPortalRoot(
        <Modal>
          <Span>modal content</Span>
        </Modal>,
      ),
    )
    expect(queryByText('modal content')).toBeNull()
  })

  it('renders its content (via Portal) when defaultValue is true', () => {
    const { queryByText } = render(
      withPortalRoot(
        <Modal defaultValue>
          <Span>modal content</Span>
        </Modal>,
      ),
    )
    expect(queryByText('modal content')).toBeTruthy()
  })

  it('closes when the backdrop is pressed (uncontrolled)', () => {
    const { queryByText, container } = render(
      withPortalRoot(
        <Modal defaultValue>
          <Span>modal content</Span>
        </Modal>,
      ),
    )
    expect(queryByText('modal content')).toBeTruthy()

    // backdrop is the first Pressable (button) rendered inside the portal
    const backdrop = document.body.querySelector('button')!
    fireEvent.click(backdrop)
    expect(queryByText('modal content')).toBeNull()
    void container
  })

  it('calls onChange(false) when the backdrop is pressed', () => {
    const onChange = vi.fn()
    render(
      withPortalRoot(
        <Modal defaultValue onChange={onChange}>
          <Span>modal content</Span>
        </Modal>,
      ),
    )
    const backdrop = document.body.querySelector('button')!
    fireEvent.click(backdrop)
    expect(onChange).toHaveBeenCalledWith(false)
  })

  it('is controlled via the value prop - pressing the backdrop alone does not close it', () => {
    const onChange = vi.fn()
    const { queryByText } = render(
      withPortalRoot(
        <Modal value onChange={onChange}>
          <Span>modal content</Span>
        </Modal>,
      ),
    )
    const backdrop = document.body.querySelector('button')!
    fireEvent.click(backdrop)
    expect(onChange).toHaveBeenCalledWith(false)
    // still open/rendered since the controlled `value` prop hasn't changed
    expect(queryByText('modal content')).toBeTruthy()
  })
})
