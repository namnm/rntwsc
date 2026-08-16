'use client'

// @vitest-environment jsdom
import { renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { useRefConstruct } from '#/libs/hooks/use-ref-construct'

describe('useRefConstruct', () => {
  it('calls the constructor exactly once across re-renders', () => {
    const construct = vi.fn(() => ({
      id: 1,
    }))
    const { rerender } = renderHook(() => useRefConstruct(construct))
    rerender()
    rerender()
    expect(construct).toHaveBeenCalledTimes(1)
  })

  it('returns the same object identity across re-renders', () => {
    const { result, rerender } = renderHook(() =>
      useRefConstruct(() => ({
        id: Math.random(),
      })),
    )
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })
})
