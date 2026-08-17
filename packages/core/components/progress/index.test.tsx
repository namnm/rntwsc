// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Progress } from '#/core/components/progress'

describe('Progress', () => {
  it('sets the indicator width from value/max', () => {
    const { container } = render(<Progress value={25} />)
    const indicator = container.querySelector('[style*="width"]') as HTMLElement
    expect(indicator.style.width).toBe('25%')
  })

  it('clamps a value above max to 100%', () => {
    const { container } = render(<Progress value={999} />)
    const indicator = container.querySelector('[style*="width"]') as HTMLElement
    expect(indicator.style.width).toBe('100%')
  })

  it('clamps a negative value to 0%', () => {
    const { container } = render(<Progress value={-10} />)
    const indicator = container.querySelector('[style*="width"]') as HTMLElement
    expect(indicator.style.width).toBe('0%')
  })

  it('applies default size/shape/type classes', () => {
    const { container } = render(<Progress value={50} />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-2.5')
    expect(cls).toContain('rounded-md')
  })

  it('switches type color', () => {
    const { container } = render(<Progress value={50} type='success' />)
    const indicator = container.querySelector('[style*="width"]') as HTMLElement
    expect(indicator.className).toContain('bg-success')
  })

  it('clamps accessibilityValue.now to max, never reporting an out-of-range value', () => {
    const { container } = render(<Progress value={999} max={100} />)
    expect(container.firstChild).toHaveAttribute('aria-valuenow', '100')
  })

  it('does not produce NaN width when max is 0', () => {
    const { container } = render(<Progress value={5} max={0} />)
    const indicator = container.querySelector('[style*="width"]') as HTMLElement
    expect(indicator.style.width).toBe('0%')
  })
})
