import { beforeEach, describe, expect, it } from 'vitest'

import type { StorageAdapter } from '#/libs/storage'
import { setAdapter, storage } from '#/libs/storage'

const noopAdapter: StorageAdapter = {
  getItem: async () => null,
  setItem: async () => undefined,
  removeItem: async () => undefined,
}

describe('storage', () => {
  beforeEach(() => {
    setAdapter(noopAdapter)
  })

  it('defaults to a noop adapter that resolves null/undefined', async () => {
    await expect(storage.getItem('k')).resolves.toBeNull()
    await expect(storage.setItem('k', 'v')).resolves.toBeUndefined()
    await expect(storage.removeItem('k')).resolves.toBeUndefined()
  })

  it('delegates to whatever adapter was set via setAdapter', async () => {
    const store = new Map<string, string>()
    setAdapter({
      getItem: async k => store.get(k) ?? null,
      setItem: async (k, v) => {
        store.set(k, v)
      },
      removeItem: async k => {
        store.delete(k)
      },
    })

    await storage.setItem('key', 'value')
    await expect(storage.getItem('key')).resolves.toBe('value')
    await storage.removeItem('key')
    await expect(storage.getItem('key')).resolves.toBeNull()
  })

  it('always reads the currently set adapter (not a snapshot taken at import time)', async () => {
    let calls = 0
    setAdapter({
      ...noopAdapter,
      getItem: async () => {
        calls++
        return 'first'
      },
    })
    await storage.getItem('k')

    setAdapter({
      ...noopAdapter,
      getItem: async () => {
        calls++
        return 'second'
      },
    })
    await expect(storage.getItem('k')).resolves.toBe('second')
    expect(calls).toBe(2)
  })
})
