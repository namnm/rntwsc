import { describe, expect, it } from 'vitest'

import { hydrationKey } from '#/core/hydration/config'

describe('hydrationKey', () => {
  const hk = hydrationKey<{ url: string; salt?: string }>('fetch')

  it('produces the same key for the same input regardless of property order', () => {
    const a = hk.key({
      url: 'x',
      salt: 's',
    })
    const b = hk.key({
      salt: 's',
      url: 'x',
    })
    expect(a).toBe(b)
  })

  it('produces a different key when any input field differs', () => {
    const base = hk.key({
      url: 'x',
      salt: 's',
    })
    expect(
      hk.key({
        url: 'y',
        salt: 's',
      }),
    ).not.toBe(base)
    expect(
      hk.key({
        url: 'x',
        salt: 't',
      }),
    ).not.toBe(base)
    expect(
      hk.key({
        url: 'x',
      }),
    ).not.toBe(base)
  })

  it('namespaces keys by type, so two different hydrationKey() callers never collide', () => {
    const other = hydrationKey<{ url: string; salt?: string }>('graphql')
    const input = {
      url: 'x',
      salt: 's',
    }
    expect(hk.key(input)).not.toBe(other.key(input))
  })

  it('parse() round-trips a key produced by key(), plus the type discriminator', () => {
    const input = {
      url: 'x',
      salt: 's',
    }
    const k = hk.key(input)
    expect(hk.parse(k)).toEqual({
      ...input,
      type: 'fetch',
    })
  })

  it('parse() returns undefined for a key belonging to a different type', () => {
    const other = hydrationKey<{ url: string }>('graphql')
    const k = other.key({
      url: 'x',
    })
    expect(hk.parse(k)).toBeUndefined()
  })

  it('parse() returns undefined for a non-JSON string', () => {
    expect(hk.parse('not json')).toBeUndefined()
  })
})
