// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Skeleton } from '#/core/components/skeleton'

describe('Skeleton', () => {
  it('renders with the pulse animation class', () => {
    const { container } = render(<Skeleton />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'animate-pulse',
    )
  })

  it('merges a custom className', () => {
    const { container } = render(<Skeleton className='h-10' />)
    expect((container.firstChild as HTMLElement).className).toContain('h-10')
  })
})
