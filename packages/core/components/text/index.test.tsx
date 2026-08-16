// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { H1, H2, H3, H4, H5, H6, Span } from '#/core/components/text'

describe('heading components', () => {
  it.each([
    [H1, 'text-4xl', '1'],
    [H2, 'text-3xl', '2'],
    [H3, 'text-2xl', '3'],
    [H4, 'text-xl', '4'],
    [H5, 'text-lg', '5'],
    [H6, 'text-md', '6'],
  ] as const)(
    '%# renders with the header accessibility role and level',
    (Comp, sizeClass, level) => {
      const { getByRole } = render((<Comp>Heading</Comp>) as any)
      const el = getByRole('heading')
      expect(el.textContent).toBe('Heading')
      expect(el.className).toContain(sizeClass)
      expect(el.getAttribute('aria-level')).toBe(level)
    },
  )

  it('merges a custom className onto H1', () => {
    const { getByRole } = render((<H1 className='text-red-500'>x</H1>) as any)
    expect(getByRole('heading').className).toContain('text-red-500')
  })
})

describe('Span', () => {
  it('renders its text content', () => {
    const { getByText } = render((<Span>hello</Span>) as any)
    expect(getByText('hello')).toBeTruthy()
  })

  it('renders as a <span> element (rnwTag)', () => {
    const { container } = render((<Span>hello</Span>) as any)
    expect(container.querySelector('span')).toBeTruthy()
  })
})
