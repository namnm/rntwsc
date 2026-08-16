// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Checkbox } from '#/core/components/checkbox'

describe('Checkbox', () => {
  it('renders unchecked by default with no visible indicator', () => {
    const { container } = render(<Checkbox testID='cb' />)
    // Indicator only renders the Check icon when checked
    expect(container.querySelector('svg')).toBeNull()
  })

  it('renders checked when defaultChecked is true', () => {
    const { container } = render(<Checkbox testID='cb' defaultChecked />)
    expect(container.querySelector('svg')).not.toBeNull()
  })

  it('toggles checked state on press (uncontrolled)', () => {
    const { container, getByTestId } = render(<Checkbox testID='cb' />)
    expect(container.querySelector('svg')).toBeNull()

    fireEvent.click(getByTestId('cb'))
    expect(container.querySelector('svg')).not.toBeNull()

    fireEvent.click(getByTestId('cb'))
    expect(container.querySelector('svg')).toBeNull()
  })

  it('calls onChange with the next checked value', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(<Checkbox testID='cb' onChange={onChange} />)
    fireEvent.click(getByTestId('cb'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('is controlled when checked prop is passed - press does not flip it locally', () => {
    const onChange = vi.fn()
    const { container, getByTestId } = render(
      <Checkbox testID='cb' checked={false} onChange={onChange} />,
    )
    fireEvent.click(getByTestId('cb'))
    expect(onChange).toHaveBeenCalledWith(true)
    // still unchecked visually since the controlled `checked` prop wasn't updated
    expect(container.querySelector('svg')).toBeNull()
  })

  it('does not call onChange when disabled', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <Checkbox testID='cb' disabled onChange={onChange} />,
    )
    fireEvent.click(getByTestId('cb'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('renders custom children instead of the default Indicator when provided', () => {
    const { getByText } = render(
      <Checkbox testID='cb' defaultChecked>
        <Checkbox.Indicator />
        custom-child
      </Checkbox>,
    )
    expect(getByText('custom-child')).toBeTruthy()
  })
})
