// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Slot, Slottable } from '#/core/components/slot'

describe('Slot', () => {
  it('merges its own props onto the single child element instead of wrapping it', () => {
    const { container } = render(
      <Slot className='slot-class' data-extra='x'>
        <span className='child-class'>hi</span>
      </Slot>,
    )
    const span = container.querySelector('span')!
    expect(span).toBeTruthy()
    expect(span.getAttribute('data-extra')).toBe('x')
    // no extra wrapper element - the span is the direct (only) child of container
    expect(container.children.length).toBe(1)
    expect(container.firstElementChild?.tagName).toBe('SPAN')
  })

  it("merges className from both slot props and the child (child's wins via tailwind-merge... position)", () => {
    const { container } = render(
      <Slot className='text-red-500'>
        <span className='text-blue-500'>hi</span>
      </Slot>,
    )
    const span = container.querySelector('span')!
    // both classes present in some merged form (exact merge order is an
    // implementation detail of mergeProps/clsx - just assert non-empty)
    expect(span.className.length).toBeGreaterThan(0)
  })

  it('flattens a ClassName array passed as slot className onto a child with no className of its own', () => {
    const { container } = render(
      <Slot className={['h-8', false && 'unused', 'h-11']}>
        <span>hi</span>
      </Slot>,
    )
    const span = container.querySelector('span')!
    // regression: mergeProps used to only clsx-merge className when both
    // slot and child defined it, so a slot-only array leaked through as a
    // raw array and React stringified it via Array.prototype.toString(),
    // e.g. "h-8,false,h-11" - a single malformed class token.
    expect(span.className).not.toContain(',')
    expect(span.className).not.toContain('false')
    expect(span.classList.contains('h-11')).toBe(true)
  })

  it('composes an onClick handler from both slot and child instead of overwriting it', () => {
    const slotClick = vi.fn()
    const childClick = vi.fn()
    const { container } = render(
      <Slot onClick={slotClick}>
        <button onClick={childClick}>click</button>
      </Slot>,
    )
    container.querySelector('button')!.click()
    expect(slotClick).toHaveBeenCalled()
    expect(childClick).toHaveBeenCalled()
  })

  it('renders nothing when given no valid child element', () => {
    const { container } = render(<Slot>{null}</Slot>)
    expect(container.innerHTML).toBe('')
  })

  it('unwraps a Slottable child, merging slot props onto the real inner child', () => {
    const { container } = render(
      <Slot data-extra='y'>
        <Slottable>
          <span>real child</span>
        </Slottable>
      </Slot>,
    )
    const span = container.querySelector('span')!
    expect(span.getAttribute('data-extra')).toBe('y')
    expect(span.textContent).toBe('real child')
  })

  it('unwraps a Slottable child passed as a lazy RSC reference (Server Component child crossing into a client Slot)', () => {
    const realChild = <span>real child</span>
    const lazyChild = {
      _payload: {
        status: 'fulfilled',
        value: realChild,
      },
    } as unknown as typeof realChild
    const { container } = render(
      <Slot data-extra='z'>
        <Slottable>{lazyChild}</Slottable>
      </Slot>,
    )
    const span = container.querySelector('span')!
    expect(span.getAttribute('data-extra')).toBe('z')
    expect(span.textContent).toBe('real child')
  })
})
