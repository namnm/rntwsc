'use client'

// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { hk } from '#/core/fetch/config'
import { useFetch } from '#/core/fetch/index.browser' // eslint-disable-line custom/no-import-invalid-variant
import { clearFetchData, getFetchData } from '#/core/fetch/store'

// Regression tests for docs/todo.md issue 17: neither an unmounted
// component's in-flight fetch nor an out-of-order response from a
// superseded refetch() call should be able to write into the shared store.
const flush = () => act(() => Promise.resolve())

describe('useFetch (browser) - request cancellation', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('aborts the in-flight request when the component unmounts', async () => {
    const url = 'https://x/unmount-test'
    let capturedSignal: AbortSignal | undefined
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        capturedSignal = init?.signal as AbortSignal
        return new Promise(() => {})
      }),
    )
    clearFetchData(
      hk.key({
        url,
      }),
    )

    const { unmount } = renderHook(() =>
      useFetch({
        url,
      }),
    )
    await flush()

    expect(capturedSignal?.aborted).toBe(false)
    act(() => unmount())
    expect(capturedSignal?.aborted).toBe(true)
  })

  it('aborts a superseded in-flight refetch, and its late response cannot overwrite the newer result', async () => {
    const url = 'https://x/refetch-race'
    const k = hk.key({
      url,
    })
    clearFetchData(k)

    let resolveFirst: ((v: unknown) => void) | undefined
    let firstSignal: AbortSignal | undefined
    let secondSignal: AbortSignal | undefined
    let calls = 0
    vi.stubGlobal(
      'fetch',
      vi.fn((_url: string, init?: RequestInit) => {
        calls += 1
        if (calls === 1) {
          firstSignal = init?.signal as AbortSignal
          return new Promise(resolve => {
            resolveFirst = resolve as (v: unknown) => void
          })
        }
        secondSignal = init?.signal as AbortSignal
        return Promise.resolve({
          ok: true,
          json: async () => ({
            v: 'second',
          }),
        })
      }),
    )

    const { result } = renderHook(() =>
      useFetch({
        url,
      }),
    )
    await flush()
    expect(firstSignal?.aborted).toBe(false)

    // a manual refetch before the first request resolves supersedes it
    await act(async () => {
      await result.current.refetch()
    })
    expect(firstSignal?.aborted).toBe(true)
    expect(secondSignal?.aborted).toBe(false)
    expect(getFetchData(k)?.data).toEqual({
      v: 'second',
    })

    // the first (aborted) request finally settling must not overwrite the
    // second, newer result
    await act(async () => {
      resolveFirst?.({
        ok: true,
        json: async () => ({
          v: 'first-stale',
        }),
      })
    })
    expect(getFetchData(k)?.data).toEqual({
      v: 'second',
    })
  })
})
