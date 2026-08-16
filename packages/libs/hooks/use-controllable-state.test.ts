// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useControllableState } from '#/libs/hooks/use-controllable-state'

describe('useControllableState - uncontrolled', () => {
  it('initializes from defaultValue and updates its own state', () => {
    const { result } = renderHook(() =>
      useControllableState<string>({
        defaultValue: 'a',
      }),
    )
    expect(result.current[0]).toBe('a')

    act(() => result.current[1]('b'))
    expect(result.current[0]).toBe('b')
  })

  it('supports a functional updater reading the latest state', () => {
    const { result } = renderHook(() =>
      useControllableState<number>({
        defaultValue: 1,
      }),
    )
    act(() => result.current[1](prev => prev + 1))
    expect(result.current[0]).toBe(2)
  })

  it('calls onChange with the next value on update', () => {
    const onChange = vi.fn()
    const { result } = renderHook(() =>
      useControllableState<string>({
        defaultValue: 'a',
        onChange,
      }),
    )
    act(() => result.current[1]('b'))
    expect(onChange).toHaveBeenCalledWith('b')
  })
})

describe('useControllableState - controlled', () => {
  it('reflects the passed value instead of internal state', () => {
    const { result, rerender } = renderHook(
      ({ value }) =>
        useControllableState<string>({
          value,
        }),
      {
        initialProps: {
          value: 'x',
        },
      },
    )
    expect(result.current[0]).toBe('x')

    rerender({
      value: 'y',
    })
    expect(result.current[0]).toBe('y')
  })

  it('setState does not change local state - it only calls onChange (parent owns the value)', () => {
    const onChange = vi.fn()
    const { result, rerender } = renderHook(
      ({ value }) =>
        useControllableState<string>({
          value,
          onChange,
        }),
      {
        initialProps: {
          value: 'x',
        },
      },
    )
    act(() => result.current[1]('z'))
    expect(onChange).toHaveBeenCalledWith('z')
    // value prop hasn't changed yet (caller must feed it back), so state
    // still reflects the prop, not the requested next value
    expect(result.current[0]).toBe('x')
    rerender({
      value: 'z',
    })
    expect(result.current[0]).toBe('z')
  })
})

describe('useControllableState - mode switch warning', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
  })
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('warns when switching from uncontrolled to controlled', () => {
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { rerender } = renderHook(
      ({ value }: { value?: string }) =>
        useControllableState<string>({
          value,
        }),
      {
        initialProps: {
          value: undefined as string | undefined,
        },
      },
    )
    rerender({
      value: 'now-controlled',
    })
    expect(errSpy).toHaveBeenCalledWith(
      expect.stringContaining('switched from uncontrolled to controlled'),
    )
    errSpy.mockRestore()
  })
})
