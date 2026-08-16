// @vitest-environment jsdom
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { createSvgIcon } from '#/core/components/icon'

describe('createSvgIcon', () => {
  it('with no explicit size, width follows the ambient font-size and height follows line-height (default text-sm)', () => {
    const MockSvg = (props: any) => <svg data-testid='icon' {...props} />
    const Icon = createSvgIcon(MockSvg)
    const { getByTestId } = render(<Icon />)
    const svg = getByTestId('icon')
    expect(svg.getAttribute('width')).toBe('14')
    expect(svg.getAttribute('height')).toBe('20')
  })

  it('honors an explicit size prop for both width and height', () => {
    const MockSvg = (props: any) => <svg data-testid='icon' {...props} />
    const Icon = createSvgIcon(MockSvg)
    const { getByTestId } = render(<Icon size={16} />)
    const svg = getByTestId('icon')
    expect(svg.getAttribute('width')).toBe('16')
    expect(svg.getAttribute('height')).toBe('16')
  })

  it('forwards a className down to the underlying Svg', () => {
    const MockSvg = (props: any) => <svg data-testid='icon' {...props} />
    const Icon = createSvgIcon(MockSvg)
    const { getByTestId } = render(<Icon className='text-red-500' />)
    expect(getByTestId('icon').getAttribute('class')).toContain('text-red-500')
  })
})
