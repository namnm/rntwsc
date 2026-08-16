'use client'

// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Portal } from '#/core/components/portal'

describe('Portal', () => {
  it('renders its children into document.body via Portal.Root, not in place', () => {
    const { container, getByText } = render(
      <div>
        <Portal>
          <span>portaled content</span>
        </Portal>
        <Portal.Root />
      </div>,
    )
    // not rendered inline where <Portal> was written
    expect(container.querySelector('span')).toBeNull()
    // but present somewhere in the document (rendered into document.body)
    expect(getByText('portaled content')).toBeTruthy()
    expect(document.body.contains(getByText('portaled content'))).toBe(true)
  })

  it('removes the content from the DOM once the Portal item unmounts', () => {
    const { queryByText, rerender } = render(
      <div>
        <Portal>
          <span>temporary</span>
        </Portal>
        <Portal.Root />
      </div>,
    )
    expect(queryByText('temporary')).toBeTruthy()

    rerender(
      <div>
        <Portal.Root />
      </div>,
    )
    expect(queryByText('temporary')).toBeNull()
  })

  it('renders nothing extra when there are no portal items', () => {
    const { container } = render(<Portal.Root />)
    expect(container.innerHTML).toBe('')
  })
})
