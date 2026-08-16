// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { InsetShadow } from '#/core/components/inset'

describe('InsetShadow', () => {
  it('is invisible (opacity-0) by default', () => {
    const { container } = render(<InsetShadow />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'opacity-0',
    )
  })

  it('becomes visible when enabled', () => {
    const { container } = render(<InsetShadow enabled />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('opacity-100')
  })

  it('does not intercept pointer events', () => {
    const { container } = render(<InsetShadow />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'pointer-events-none',
    )
  })

  it('merges a custom className', () => {
    const { container } = render(<InsetShadow className='rounded-full' />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'rounded-full',
    )
  })
})
