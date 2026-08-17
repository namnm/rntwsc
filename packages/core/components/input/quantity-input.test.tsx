// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QuantityInput } from '#/core/components/input/quantity-input'

describe('QuantityInput', () => {
  it('increments/decrements by step on the prefix/suffix buttons', () => {
    const { container, getAllByRole } = render(
      (<QuantityInput testID='qty' defaultValue='5' step={2} />) as any,
    )
    const input = container.querySelector('input') as HTMLInputElement
    const buttons = getAllByRole('button')
    fireEvent.click(buttons[1])
    expect(input.value).toBe('7')
    fireEvent.click(buttons[0])
    fireEvent.click(buttons[0])
    expect(input.value).toBe('3')
  })

  it('falls back to min instead of "NaN" when blurring a non-numeric value', () => {
    const { container } = render(
      (<QuantityInput testID='qty' defaultValue='5' min={1} />) as any,
    )
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, {
      target: {
        value: 'abc',
      },
    })
    fireEvent.blur(input)
    expect(input.value).toBe('1')
  })

  it('clamps a blurred value to min/max', () => {
    const { container } = render(
      (<QuantityInput testID='qty' defaultValue='5' min={1} max={10} />) as any,
    )
    const input = container.querySelector('input') as HTMLInputElement
    fireEvent.change(input, {
      target: {
        value: '999',
      },
    })
    fireEvent.blur(input)
    expect(input.value).toBe('10')
  })
})
