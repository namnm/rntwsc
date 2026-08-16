// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Separator } from '#/core/components/separator'

describe('Separator', () => {
  it('renders as aria-hidden (decorative)', () => {
    const { container } = render(<Separator />)
    expect(container.firstChild).toHaveAttribute('aria-hidden')
  })

  it('applies the default divider styling', () => {
    const { container } = render(<Separator />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'bg-gray-200',
    )
  })

  it('merges a custom className with the default styles', () => {
    const { container } = render(<Separator className='my-8' />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('my-8')
    // tailwind-merge should drop the conflicting default my-2 in favor of my-8
    expect(cls).not.toContain('my-2')
  })
})
