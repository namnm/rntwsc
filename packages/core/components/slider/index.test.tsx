// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { computeSliderValue, Slider } from '#/core/components/slider'

describe('computeSliderValue', () => {
  it('maps a locationX ratio onto the min/max range', () => {
    expect(
      computeSliderValue({
        locationX: 50,
        trackWidth: 100,
        min: 0,
        max: 100,
      }),
    ).toBe(50)
  })

  it('clamps below the track start to min', () => {
    expect(
      computeSliderValue({
        locationX: -20,
        trackWidth: 100,
        min: 0,
        max: 100,
      }),
    ).toBe(0)
  })

  it('clamps past the track end to max', () => {
    expect(
      computeSliderValue({
        locationX: 500,
        trackWidth: 100,
        min: 0,
        max: 100,
      }),
    ).toBe(100)
  })

  it('snaps to the given step', () => {
    expect(
      computeSliderValue({
        locationX: 22,
        trackWidth: 100,
        min: 0,
        max: 100,
        step: 10,
      }),
    ).toBe(20)
  })

  it('returns min when the track has not been measured yet', () => {
    expect(
      computeSliderValue({
        locationX: 50,
        trackWidth: 0,
        min: 10,
        max: 100,
      }),
    ).toBe(10)
  })
})

describe('Slider', () => {
  it('reflects the value as the indicator/thumb position', () => {
    const { container } = render(<Slider value={25} />)
    const styled = container.querySelectorAll('[style*="25%"]')
    expect(styled.length).toBe(2)
  })

  it('applies default size/type classes', () => {
    const { container } = render(<Slider value={0} />)
    const cls = (container.firstChild as HTMLElement).className
    expect(cls).toContain('h-4')
  })

  it('applies the disabled class', () => {
    const { container } = render(<Slider value={0} disabled />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'opacity-50',
    )
  })
})
