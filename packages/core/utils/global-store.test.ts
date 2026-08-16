import { describe, expect, it } from 'vitest'

import { globalStore } from '#/core/utils/global-store'

describe('globalStore', () => {
  it('lazily initializes on first get, calling init only once', () => {
    let calls = 0
    const store = globalStore('__test_globalStore_lazy', () => {
      calls++
      return 'value'
    })
    expect(calls).toBe(0)
    expect(store.get()).toBe('value')
    expect(store.get()).toBe('value')
    expect(calls).toBe(1)
  })

  it('set overrides the value read back by get', () => {
    const store = globalStore('__test_globalStore_set', () => 'initial')
    store.set('updated')
    expect(store.get()).toBe('updated')
  })

  it('shares state across independent globalStore(key, ...) calls with the same key', () => {
    const a = globalStore('__test_globalStore_shared', () => 'a-init')
    const b = globalStore('__test_globalStore_shared', () => 'b-init')
    a.set('from-a')
    expect(b.get()).toBe('from-a')
  })

  it('keeps state independent across different keys', () => {
    const a = globalStore('__test_globalStore_key_a', () => 'a')
    const b = globalStore('__test_globalStore_key_b', () => 'b')
    a.set('changed')
    expect(b.get()).toBe('b')
  })
})
