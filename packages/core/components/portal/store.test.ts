// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import {
  addPortal,
  removePortal,
  usePortalItems,
} from '#/core/components/portal/store'

// itemsStore/listenersStore live on globalThis (see global-store.ts), so
// state persists across tests - always leave it empty afterward.
afterEach(() => {
  const { result } = renderHook(() => usePortalItems())
  for (const item of result.current) {
    act(() => removePortal(item.id))
  }
})

describe('portal store', () => {
  it('starts empty', () => {
    const { result } = renderHook(() => usePortalItems())
    expect(result.current).toEqual([])
  })

  it('adding a portal notifies subscribers with the new item', () => {
    const { result } = renderHook(() => usePortalItems())
    act(() => addPortal('a', 'node-a'))
    expect(result.current).toEqual([
      {
        id: 'a',
        node: 'node-a',
        disableBodyScroll: undefined,
      },
    ])
  })

  it('adding with an existing id replaces that item in place (not appended)', () => {
    const { result } = renderHook(() => usePortalItems())
    act(() => addPortal('a', 'first'))
    act(() => addPortal('a', 'second'))
    expect(result.current).toHaveLength(1)
    expect(result.current[0].node).toBe('second')
  })

  it('removing a portal by id drops just that item', () => {
    const { result } = renderHook(() => usePortalItems())
    act(() => {
      addPortal('a', 'node-a')
      addPortal('b', 'node-b')
    })
    act(() => removePortal('a'))
    expect(result.current.map(i => i.id)).toEqual(['b'])
  })

  it('removing an id that does not exist is a harmless no-op', () => {
    const { result } = renderHook(() => usePortalItems())
    act(() => addPortal('a', 'node-a'))
    act(() => removePortal('does-not-exist'))
    expect(result.current).toHaveLength(1)
  })
})
