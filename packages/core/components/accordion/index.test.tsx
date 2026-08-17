// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Accordion } from '#/core/components/accordion'
import { Span } from '#/core/components/text'

// AccordionProps is a discriminated union on `multiple` - Partial<> would
// collapse that discriminant, multiple?: true | undefined stops narrowing
// the rest of the type, so this harness stays loosely typed; the real
// per-call prop shapes below are still valid AccordionProps at each call
// site, which is what actually matters here.
const TwoItems = (props: any) => (
  <Accordion {...props}>
    <Accordion.Item value='a'>
      <Accordion.Trigger testID='trigger-a'>A</Accordion.Trigger>
      <Accordion.Content>
        <Span>content a</Span>
      </Accordion.Content>
    </Accordion.Item>
    <Accordion.Item value='b'>
      <Accordion.Trigger testID='trigger-b'>B</Accordion.Trigger>
      <Accordion.Content>
        <Span>content b</Span>
      </Accordion.Content>
    </Accordion.Item>
  </Accordion>
)

describe('Accordion - single mode', () => {
  it('opens the item whose trigger was pressed', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(<TwoItems onChange={onChange} />)
    fireEvent.click(getByTestId('trigger-a'))
    expect(onChange).toHaveBeenCalledWith('a')
  })

  it('switches to a different item, closing the previous one (single mode)', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <TwoItems defaultValue='a' onChange={onChange} />,
    )
    fireEvent.click(getByTestId('trigger-b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })

  it('collapses the open item when its trigger is pressed again (collapsible default true)', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <TwoItems defaultValue='a' onChange={onChange} />,
    )
    fireEvent.click(getByTestId('trigger-a'))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('does not collapse when collapsible is false', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <TwoItems defaultValue='a' collapsible={false} onChange={onChange} />,
    )
    fireEvent.click(getByTestId('trigger-a'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('Accordion - multiple mode', () => {
  it('allows more than one item open at once', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <TwoItems multiple defaultValue={['a']} onChange={onChange} />,
    )
    fireEvent.click(getByTestId('trigger-b'))
    expect(onChange).toHaveBeenCalledWith(['a', 'b'])
  })

  it('removes an item from the open set when its trigger is pressed again', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      <TwoItems multiple defaultValue={['a', 'b']} onChange={onChange} />,
    )
    fireEvent.click(getByTestId('trigger-a'))
    expect(onChange).toHaveBeenCalledWith(['b'])
  })
})

describe('Accordion - disabled', () => {
  it('does not open a disabled item on press', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(<TwoItems disabled onChange={onChange} />)
    fireEvent.click(getByTestId('trigger-a'))
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('Accordion - accessibility', () => {
  it('reflects the open state via aria-expanded', () => {
    const { getByTestId } = render(<TwoItems defaultValue='a' />)
    expect(getByTestId('trigger-a').getAttribute('aria-expanded')).toBe('true')
    expect(getByTestId('trigger-b').getAttribute('aria-expanded')).toBe('false')
  })

  it('marks the invisible measurement clone of content as aria-hidden', () => {
    const { container } = render(<TwoItems defaultValue='a' />)
    const hidden = container.querySelectorAll('[aria-hidden="true"]')
    expect(hidden.length).toBeGreaterThan(0)
  })
})
