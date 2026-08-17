// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Switch } from '#/core/components/switch'

describe('Switch', () => {
  it('toggles on press (uncontrolled)', () => {
    const { getByTestId } = render((<Switch testID='sw' />) as any)
    fireEvent.click(getByTestId('sw'))
    fireEvent.click(getByTestId('sw'))
  })

  it('calls onChange with the next value', () => {
    const onChange = vi.fn()
    const { getByTestId } = render(
      (<Switch testID='sw' onChange={onChange} />) as any,
    )
    fireEvent.click(getByTestId('sw'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('exposes switch role and disabled accessibility state', () => {
    const { getByTestId } = render((<Switch testID='sw' disabled />) as any)
    expect(getByTestId('sw').getAttribute('role')).toBe('switch')
    expect(getByTestId('sw').getAttribute('aria-disabled')).toBe('true')
  })

  it('applies the invalid ring class', () => {
    const { getByTestId } = render((<Switch testID='sw' invalid />) as any)
    expect(getByTestId('sw').className).toContain('ring-error')
  })
})
