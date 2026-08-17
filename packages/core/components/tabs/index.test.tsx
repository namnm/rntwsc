// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Tabs } from '#/core/components/tabs'

const Example = () => (
  <Tabs defaultValue='a'>
    <Tabs.List>
      <Tabs.Trigger value='a' testID='trigger-a'>
        A
      </Tabs.Trigger>
      <Tabs.Trigger value='b' testID='trigger-b'>
        B
      </Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value='a'>Content A</Tabs.Content>
    <Tabs.Content value='b'>Content B</Tabs.Content>
  </Tabs>
)

describe('Tabs', () => {
  it('shows the default tab content', () => {
    const { getByText, queryByText } = render(<Example />)
    expect(getByText('Content A')).toBeTruthy()
    expect(queryByText('Content B')).toBeNull()
  })

  it('switches content when a trigger is pressed', () => {
    const { getByTestId, getByText, queryByText } = render(<Example />)
    fireEvent.click(getByTestId('trigger-b'))
    expect(getByText('Content B')).toBeTruthy()
    expect(queryByText('Content A')).toBeNull()
  })

  it('applies the active class to the selected trigger only', () => {
    const { getByTestId } = render(<Example />)
    expect(getByTestId('trigger-a').className).toContain('border-primary')
    expect(getByTestId('trigger-b').className).not.toContain('border-primary')

    fireEvent.click(getByTestId('trigger-b'))
    expect(getByTestId('trigger-b').className).toContain('border-primary')
    expect(getByTestId('trigger-a').className).not.toContain('border-primary')
  })

  it('exposes tab role and aria-selected reflecting the active trigger', () => {
    const { getByTestId } = render(<Example />)
    expect(getByTestId('trigger-a').getAttribute('role')).toBe('tab')
    expect(getByTestId('trigger-a').getAttribute('aria-selected')).toBe('true')
    expect(getByTestId('trigger-b').getAttribute('aria-selected')).toBe('false')

    fireEvent.click(getByTestId('trigger-b'))
    expect(getByTestId('trigger-b').getAttribute('aria-selected')).toBe('true')
  })
})
