// @vitest-environment jsdom
import { act, fireEvent, render } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

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

  it('resyncs the displayed text when the controlled value changes externally', () => {
    const { getByTestId, rerender } = render(
      (
        <div>
          <Combobox items={items} testID='combobox' value='us' />
          <Portal.Root />
        </div>
      ) as any,
    )
    expect((getByTestId('combobox') as HTMLInputElement).value).toBe(
      'United States',
    )

    rerender(
      (
        <div>
          <Combobox items={items} testID='combobox' value='ca' />
          <Portal.Root />
        </div>
      ) as any,
    )
    expect((getByTestId('combobox') as HTMLInputElement).value).toBe('Canada')
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

describe('Combobox - async items (function fetcher)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('calls the fetcher with the debounced query text and renders the result', async () => {
    vi.useFakeTimers()
    const fetchItems = vi.fn((q: string) =>
      Promise.resolve(
        items.filter(i => i.label.toLowerCase().includes(q.toLowerCase())),
      ),
    )
    const { getByTestId, getByText } = renderCombobox({
      items: fetchItems,
    })

    fireEvent.focus(getByTestId('combobox'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(fetchItems).toHaveBeenCalledWith('')

    fireEvent.change(getByTestId('combobox'), {
      target: {
        value: 'canada',
      },
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(fetchItems).toHaveBeenLastCalledWith('canada')
    expect(getByText('Canada')).toBeTruthy()
  })

  it('shows loadingLabel while the promise is pending, then the resolved items', async () => {
    vi.useFakeTimers()
    let resolvePromise: (v: typeof items) => void = () => {}
    const fetchItems = vi.fn(
      () =>
        new Promise<typeof items>(resolve => {
          resolvePromise = resolve
        }),
    )
    const { getByTestId, getByText, queryByText } = renderCombobox({
      items: fetchItems,
      loadingLabel: 'Loading items...',
    })

    fireEvent.focus(getByTestId('combobox'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(getByText('Loading items...')).toBeTruthy()

    await act(async () => {
      resolvePromise(items)
      await Promise.resolve()
    })
    expect(queryByText('Loading items...')).toBeNull()
    expect(getByText('United States')).toBeTruthy()
  })

  it('a superseded fetch does not clobber a newer result', async () => {
    vi.useFakeTimers()
    const resolvers: Array<(v: typeof items) => void> = []
    const fetchItems = vi.fn(
      () =>
        new Promise<typeof items>(resolve => {
          resolvers.push(resolve)
        }),
    )
    const { getByTestId, getByText, queryByText } = renderCombobox({
      items: fetchItems,
    })

    fireEvent.focus(getByTestId('combobox'))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    fireEvent.change(getByTestId('combobox'), {
      target: {
        value: 'x',
      },
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(300)
    })
    expect(resolvers.length).toBe(2)

    // newer request resolves first, with only Canada
    await act(async () => {
      resolvers[1]([items[2]])
      await Promise.resolve()
    })
    expect(getByText('Canada')).toBeTruthy()

    // older (stale) request resolves late, with everything - must not win
    await act(async () => {
      resolvers[0](items)
      await Promise.resolve()
    })
    expect(queryByText('United Kingdom')).toBeNull()
  })

  it('static array items stay unaffected - no debounce, no loading state', () => {
    const { getByTestId, getByText, queryByText } = renderCombobox()
    fireEvent.change(getByTestId('combobox'), {
      target: {
        value: 'canada',
      },
    })
    // filters instantly, no timer advance needed
    expect(getByText('Canada')).toBeTruthy()
    expect(queryByText('Loading...')).toBeNull()
  })
})
