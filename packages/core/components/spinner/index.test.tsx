// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Spinner } from '#/core/components/spinner'

describe('Spinner', () => {
  it('renders with the spin animation class', () => {
    const { container } = render(<Spinner />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'animate-spin',
    )
  })

  it('merges a custom className', () => {
    const { container } = render(<Spinner className='h-8 w-8' />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-8')
    expect(cls).not.toContain('h-4')
  })
})
