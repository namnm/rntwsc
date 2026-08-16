// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TextInput } from '#/core/components/input'

describe('TextInput', () => {
  it('renders an input element with the given value', () => {
    const { container } = render(
      (<TextInput testID='ti' value='hello' onChangeText={() => {}} />) as any,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.value).toBe('hello')
  })

  it('calls onChangeText as the user types', () => {
    const onChangeText = vi.fn()
    const { container } = render(
      (<TextInput testID='ti' value='' onChangeText={onChangeText} />) as any,
    )
    const input = container.querySelector('input')!
    fireEvent.change(input, {
      target: {
        value: 'a',
      },
    })
    expect(onChangeText).toHaveBeenCalledWith('a')
  })

  it('becomes non-editable when disabled', () => {
    const { container } = render(
      (
        <TextInput testID='ti' disabled value='x' onChangeText={() => {}} />
      ) as any,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.readOnly).toBe(true)
  })

  it('renders a prefix element', () => {
    const { getByText } = render(
      (
        <TextInput value='' onChangeText={() => {}} prefix={<span>$</span>} />
      ) as any,
    )
    expect(getByText('$')).toBeTruthy()
  })

  it('calls onPrefixPress when the prefix is pressed', () => {
    const onPrefixPress = vi.fn()
    const { getByText } = render(
      (
        <TextInput
          value=''
          onChangeText={() => {}}
          prefix={<span>$</span>}
          onPrefixPress={onPrefixPress}
        />
      ) as any,
    )
    fireEvent.click(getByText('$'))
    expect(onPrefixPress).toHaveBeenCalled()
  })

  it('supports a function-form prefix receiving the resolved className', () => {
    const { getByText } = render(
      (
        <TextInput
          value=''
          onChangeText={() => {}}
          prefix={cn => <span data-cn={cn as string}>icon</span>}
        />
      ) as any,
    )
    expect(getByText('icon')).toBeTruthy()
  })

  it('applies invalid styling when invalid is set', () => {
    const { container } = render(
      (
        <TextInput testID='ti' value='' onChangeText={() => {}} invalid />
      ) as any,
    )
    const input = container.querySelector('input') as HTMLInputElement
    expect(input.className).toContain('border-error')
  })
})
