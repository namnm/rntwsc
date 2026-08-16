'use client'

// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { createContext } from 'react'
import { describe, expect, it } from 'vitest'

import { useSafeContext } from '#/libs/hooks/use-safe-context'

describe('useSafeContext', () => {
  it('returns the provided value when inside a provider', () => {
    const Ctx = createContext<string | undefined>(undefined)
    const { result } = renderHook(() => useSafeContext(Ctx), {
      wrapper: ({ children }) => (
        <Ctx.Provider value='hi'>{children}</Ctx.Provider>
      ),
    })
    expect(result.current).toBe('hi')
  })

  it('throws when there is no provider (context value is undefined)', () => {
    const Ctx = createContext<string | undefined>(undefined)
    expect(() => renderHook(() => useSafeContext(Ctx))).toThrow(
      'Invalid context call',
    )
  })
})
