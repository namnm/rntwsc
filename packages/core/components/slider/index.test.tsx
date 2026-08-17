// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

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

  it('applies the invalid ring class', () => {
    const { container } = render(<Slider value={0} invalid />)
    expect((container.firstChild as HTMLElement).className).toContain(
      'ring-error',
    )
  })

  it('is keyboard focusable and steps with arrow keys', () => {
    const onChange = vi.fn()
    const { container } = render(
      <Slider value={50} step={10} onChange={onChange} />,
    )
    const el = container.firstChild as HTMLElement
    expect(el.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(el, {
      key: 'ArrowRight',
    })
    expect(onChange).toHaveBeenCalledWith(60)

    fireEvent.keyDown(el, {
      key: 'ArrowLeft',
    })
    expect(onChange).toHaveBeenCalledWith(40)

    fireEvent.keyDown(el, {
      key: 'Home',
    })
    expect(onChange).toHaveBeenCalledWith(0)

    fireEvent.keyDown(el, {
      key: 'End',
    })
    expect(onChange).toHaveBeenCalledWith(100)
  })

  it('is not keyboard focusable when disabled', () => {
    const { container } = render(<Slider value={0} disabled />)
    expect(
      (container.firstChild as HTMLElement).getAttribute('tabindex'),
    ).not.toBe('0')
  })
})
