// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { DatePicker } from '#/core/components/date-picker'
import { Portal } from '#/core/components/portal'

const withPortalRoot = (ui: ReactElement) => (
  <div>
    {ui}
    <Portal.Root />
  </div>
)

describe('DatePicker', () => {
  it('shows the placeholder when nothing is selected', () => {
    const { getByText } = render(
      withPortalRoot(<DatePicker testID='dp' placeholder='Pick a date' />),
    )
    expect(getByText('Pick a date')).toBeTruthy()
  })

  it('opens the calendar on press and selects today via the Today button', () => {
    const onChange = vi.fn()
    const { getByTestId, getByText } = render(
      withPortalRoot(<DatePicker testID='dp' onChange={onChange} />),
    )
    fireEvent.click(getByTestId('dp'))
    fireEvent.click(getByText('Today'))
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBeInstanceOf(Date)
  })

  it('forwards testID/accessibilityLabel to the trigger (props passthrough fix)', () => {
    const { getByTestId } = render(
      withPortalRoot(
        <DatePicker testID='dp' accessibilityLabel='Birth date' />,
      ),
    )
    expect(getByTestId('dp').getAttribute('aria-label')).toBe('Birth date')
  })

  it('closes the calendar when disabled toggles true while open', () => {
    const { getByTestId, queryByText, rerender } = render(
      withPortalRoot(<DatePicker testID='dp' />),
    )
    fireEvent.click(getByTestId('dp'))
    expect(queryByText('Today')).toBeTruthy()

    rerender(withPortalRoot(<DatePicker testID='dp' disabled />))
    expect(queryByText('Today')).toBeNull()
  })
})
