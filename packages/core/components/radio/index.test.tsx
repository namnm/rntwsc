// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Radio, RadioGroup } from '#/core/components/radio'

describe('Radio (standalone)', () => {
  it('renders unchecked by default (no inner dot)', () => {
    const { getByTestId } = render(<Radio testID='r' />)
    expect(getByTestId('r').children.length).toBe(0)
  })

  it('toggles on press (uncontrolled)', () => {
    const { getByTestId } = render(<Radio testID='r' />)
    fireEvent.click(getByTestId('r'))
    expect(getByTestId('r').children.length).toBe(1)
  })

  it('calls onChange with the next value', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(<Radio testID='r' onChange={onChange} />)
    fireEvent.click(getByTestId('r'))
    expect(onChange).toHaveBeenCalledWith(true)
  })
})

describe('RadioGroup', () => {
  it('renders only the selected item as checked', () => {
    const { getByTestId } = render(
      <RadioGroup defaultValue='b'>
        <RadioGroup.Item testID='a' value='a' />
        <RadioGroup.Item testID='b' value='b' />
      </RadioGroup>,
    )
    // selected item has an inner dot div, unselected doesn't
    expect(getByTestId('b').children.length).toBe(1)
    expect(getByTestId('a').children.length).toBe(0)
  })

  it('selecting an item updates which one is checked', () => {
    const { getByTestId } = render(
      <RadioGroup defaultValue='a'>
        <RadioGroup.Item testID='a' value='a' />
        <RadioGroup.Item testID='b' value='b' />
      </RadioGroup>,
    )
    fireEvent.click(getByTestId('b'))
    expect(getByTestId('b').children.length).toBe(1)
    expect(getByTestId('a').children.length).toBe(0)
  })

  it('calls onChange with the selected value', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <RadioGroup defaultValue='a' onChange={onChange}>
        <RadioGroup.Item testID='a' value='a' />
        <RadioGroup.Item testID='b' value='b' />
      </RadioGroup>,
    )
    fireEvent.click(getByTestId('b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('is controlled when value is passed at the group level', () => {
    const { getByTestId, rerender } = render(
      <RadioGroup value='a'>
        <RadioGroup.Item testID='a' value='a' />
        <RadioGroup.Item testID='b' value='b' />
      </RadioGroup>,
    )
    fireEvent.click(getByTestId('b'))
    // still 'a' selected since the controlled value prop hasn't changed
    expect(getByTestId('a').children.length).toBe(1)

    rerender(
      <RadioGroup value='b'>
        <RadioGroup.Item testID='a' value='a' />
        <RadioGroup.Item testID='b' value='b' />
      </RadioGroup>,
    )
    expect(getByTestId('b').children.length).toBe(1)
  })

  it('an item-level disabled overrides group state for that item only', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <RadioGroup defaultValue='a' onChange={onChange}>
        <RadioGroup.Item testID='a' value='a' />
        <RadioGroup.Item testID='b' value='b' disabled />
      </RadioGroup>,
    )
    fireEvent.click(getByTestId('b'))
    expect(onChange).not.toHaveBeenCalled()
  })
})
