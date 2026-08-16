// @vitest-environment jsdom
import { fireEvent, render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Button } from '#/core/components/button'

describe('Button', () => {
  it('renders its children text', () => {
    const { getByText } = render((<Button>Click me</Button>) as any)
    expect(getByText('Click me')).toBeTruthy()
  })

  it('forwards testID/accessibilityLabel and other rest props to the underlying element', () => {
    const { getByTestId } = render(
      (
        <Button testID='my-btn' accessibilityLabel='Submit form'>
          Go
        </Button>
      ) as any,
    )
    const btn = getByTestId('my-btn')
    expect(btn).toBeTruthy()
    expect(btn.getAttribute('aria-label')).toBe('Submit form')
  })

  it('calls onPress when clicked', () => {
    const onPress = vi.fn()
    const { getByTestId } = render(
      (
        <Button testID='btn' onPress={onPress}>
          Go
        </Button>
      ) as any,
    )
    fireEvent.click(getByTestId('btn'))
    expect(onPress).toHaveBeenCalledTimes(1)
  })

  it('does not call onPress when disabled', () => {
    const onPress = vi.fn()
    const { getByTestId } = render(
      (
        <Button testID='btn' disabled onPress={onPress}>
          Go
        </Button>
      ) as any,
    )
    fireEvent.click(getByTestId('btn'))
    expect(onPress).not.toHaveBeenCalled()
  })

  it('shows loadingChildren instead of children while an onPress promise is pending', async () => {
    let resolvePromise: () => void = () => {}
    const onPress = vi.fn(
      () =>
        new Promise<void>(resolve => {
          resolvePromise = resolve
        }),
    )
    const { getByTestId, getByText, queryByText } = render(
      (
        <Button testID='btn' onPress={onPress} loadingChildren='Loading...'>
          Go
        </Button>
      ) as any,
    )
    fireEvent.click(getByTestId('btn'))
    expect(await getByText('Loading...')).toBeTruthy()
    expect(queryByText('Go')).toBeNull()

    resolvePromise()
    await vi.waitFor(() => {
      expect(queryByText('Loading...')).toBeNull()
    })
    expect(getByText('Go')).toBeTruthy()
  })

  it('applies type/appearance/size/shape variant classes', () => {
    const { getByTestId } = render(
      (
        <Button
          testID='btn'
          type='primary'
          appearance='outline'
          size='lg'
          shape='pill'
        >
          Go
        </Button>
      ) as any,
    )
    // border-primary itself lands on a separate decorative <View> child
    // (see button/index.tsx's "fix react native border inconsistent
    // behavior" comment), not on the pressable trigger element itself
    const cls = getByTestId('btn').className
    expect(cls).toContain('bg-primary-100/0')
    expect(cls).toContain('h-10')
    expect(cls).toContain('rounded-full')
  })

  it('renders as disabled with reduced opacity styling', () => {
    const { container } = render((<Button disabled>Go</Button>) as any)
    // container wrapper carries the disabled opacity class
    expect((container.firstChild as HTMLElement).className).toContain(
      'opacity-70',
    )
  })
})
