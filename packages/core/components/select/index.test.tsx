// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { Portal } from '#/core/components/portal'
import { Select } from '#/core/components/select'

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

const renderSelect = (props: Partial<ComponentProps<typeof Select>> = {}) =>
  render(
    (
      <div>
        <Select items={items} testID='select' {...(props as any)} />
        <Portal.Root />
      </div>
    ) as any,
  )

describe('Select', () => {
  it('shows the placeholder when nothing is selected', () => {
    const { getByText } = renderSelect({
      placeholder: 'Pick a country',
    })
    expect(getByText('Pick a country')).toBeTruthy()
  })

  it('shows the label of the selected item instead of the placeholder', () => {
    const { getByText, queryByText } = renderSelect({
      defaultValue: 'uk',
    })
    expect(getByText('United Kingdom')).toBeTruthy()
    expect(queryByText('Select an option')).toBeNull()
  })

  it('opens the item list on press, showing every item label', () => {
    const { getByTestId, getByText } = renderSelect()
    fireEvent.click(getByTestId('select'))
    expect(getByText('United States')).toBeTruthy()
    expect(getByText('United Kingdom')).toBeTruthy()
    expect(getByText('Canada')).toBeTruthy()
  })

  it('selects an item on press and calls onChange', () => {
    const onChange = vi.fn()
    const { getByTestId, getByText } = renderSelect({
      onChange,
    })
    fireEvent.click(getByTestId('select'))
    fireEvent.click(getByText('Canada'))
    expect(onChange).toHaveBeenCalledWith('ca')
  })

  it('closes the list after selecting an item (single mode)', () => {
    const { getByTestId, getByText, queryByText } = renderSelect()
    fireEvent.click(getByTestId('select'))
    fireEvent.click(getByText('Canada'))
    expect(queryByText('United States')).toBeNull()
  })

  it('supports multiple selection, keeping the list open and accumulating values', () => {
    const onChange = vi.fn()
    const { getByTestId, getByText } = renderSelect({
      multiple: true,
      onChange,
    })
    fireEvent.click(getByTestId('select'))
    fireEvent.click(getByText('Canada'))
    expect(onChange).toHaveBeenCalledWith(['ca'])
    // list should still be open for multiple mode
    expect(getByText('United States')).toBeTruthy()

    fireEvent.click(getByText('United States'))
    expect(onChange).toHaveBeenCalledWith(['ca', 'us'])
  })

  it('deselects an already-selected item in multiple mode', () => {
    const onChange = vi.fn()
    const { getByTestId, getAllByText } = renderSelect({
      multiple: true,
      defaultValue: ['ca'],
      onChange,
    })
    fireEvent.click(getByTestId('select'))
    // "Canada" now matches twice - once as the trigger's joined label, once
    // as the list item - the list item is the one rendered last in the DOM
    fireEvent.click(getAllByText('Canada').at(-1)!)
    expect(onChange).toHaveBeenCalledWith([])
  })

  it('does not open when disabled', () => {
    const { getByTestId, queryByText } = renderSelect({
      disabled: true,
    })
    fireEvent.click(getByTestId('select'))
    expect(queryByText('United States')).toBeNull()
  })

  it('filters items via search when searchable', () => {
    const { getByTestId, getByPlaceholderText, queryAllByText } = renderSelect({
      searchable: true,
    })
    fireEvent.click(getByTestId('select'))
    const search = getByPlaceholderText('Search...')
    fireEvent.change(search, {
      target: {
        value: 'uni',
      },
    })
    // matched search text renders wrapped in a highlight <Span>, splitting
    // "United States" across sibling text nodes, and both that span's
    // parent and the span itself end up with the same full textContent -
    // match on textContent (queryAllByText, since more than one element can
    // legitimately share it) instead of requiring one exact-string element
    const byFullText = (text: string) => (_: string, el: Element | null) =>
      el?.textContent === text
    expect(queryAllByText(byFullText('United States')).length).toBeGreaterThan(
      0,
    )
    expect(queryAllByText(byFullText('United Kingdom')).length).toBeGreaterThan(
      0,
    )
    expect(queryAllByText(byFullText('Canada')).length).toBe(0)
  })

  it('shows the emptyLabel when search matches nothing', () => {
    const { getByTestId, getByPlaceholderText, getByText } = renderSelect({
      searchable: true,
      emptyLabel: 'Nothing found',
    })
    fireEvent.click(getByTestId('select'))
    fireEvent.change(getByPlaceholderText('Search...'), {
      target: {
        value: 'zzz',
      },
    })
    expect(getByText('Nothing found')).toBeTruthy()
  })

  it('forwards testID/accessibilityLabel to the trigger (props passthrough fix)', () => {
    const { getByTestId } = renderSelect({
      accessibilityLabel: 'Country',
    })
    const trigger = getByTestId('select')
    expect(trigger.getAttribute('aria-label')).toBe('Country')
  })
})
