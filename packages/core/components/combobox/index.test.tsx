// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Combobox } from '#/core/components/combobox'
import { Portal } from '#/core/components/portal'

const items = [
  {
    value: 'us',
    label: 'United States',
  },
  {
    value: 'uk',
    label: 'United Kingdom',
  },
  {
    value: 'ca',
    label: 'Canada',
  },
]

const renderCombobox = (props: Partial<ComponentProps<typeof Combobox>> = {}) =>
  render(
    (
      <div>
        <Combobox items={items} testID='combobox' {...(props as any)} />
        <Portal.Root />
      </div>
    ) as any,
  )

describe('Combobox', () => {
  it('filters the item list as the user types', () => {
    const { getByTestId, getByText, queryByText } = renderCombobox()
    fireEvent.change(getByTestId('combobox'), {
      target: {
        value: 'united',
      },
    })
    expect(getByText('United States')).toBeTruthy()
    expect(getByText('United Kingdom')).toBeTruthy()
    expect(queryByText('Canada')).toBeNull()
  })

  it('selecting an item commits the value and closes the list', () => {
    const onChange = vi.fn()
    const { getByTestId, getByText, queryByText } = renderCombobox({
      onChange,
    })
    fireEvent.change(getByTestId('combobox'), {
      target: {
        value: 'canada',
      },
    })
    fireEvent.click(getByText('Canada'))
    expect(onChange).toHaveBeenCalledWith('ca')
    expect(queryByText('United States')).toBeNull()
  })

  it('shows noResultsLabel when nothing matches', () => {
    const { getByTestId, getByText } = renderCombobox({
      noResultsLabel: 'Nothing found',
    })
    fireEvent.change(getByTestId('combobox'), {
      target: {
        value: 'zzz',
      },
    })
    expect(getByText('Nothing found')).toBeTruthy()
  })
})
