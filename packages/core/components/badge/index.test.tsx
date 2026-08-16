// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Badge } from '#/core/components/badge'

describe('Badge', () => {
  it('renders children text', () => {
    const { getByText } = render(<Badge>New</Badge>)
    expect(getByText('New')).toBeTruthy()
  })

  it('applies default size/shape/appearance/type classes', () => {
    const { container } = render(<Badge>x</Badge>)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('rounded-md')
    expect(cls).toContain('bg-gray-800')
  })

  it('applies a compound variant class for a specific type+appearance combo', () => {
    const { container } = render(
      <Badge type='success' appearance='soft'>
        x
      </Badge>,
    )
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('bg-success-50')
  })

  it('switches shape to pill', () => {
    const { container } = render(<Badge shape='pill'>x</Badge>)
    expect((container.firstChild as HTMLElement).className).toContain(
      'rounded-full',
    )
  })
})
