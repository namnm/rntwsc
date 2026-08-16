import { describe, expect, it } from 'vitest'

import { hk } from '#/core/fetch/config'

describe('fetch hk (hydration key)', () => {
  // Mirrors rntwsc/graphql's keySalt regression test - same pattern, same
  // reason: a server-only and a 'use client' component hitting the exact
  // same url used to collide on one dehydration key. rntwsc/fetch avoided
  // this in the playground demo via a `?client=true` url suffix (a real url
  // difference); keySalt is the equivalent for a url that has no natural
  // per-caller variant.
  it('gives two identical calls with different keySalt different keys', () => {
    const a = hk.key({
      url: 'https://x/hello',
      keySalt: 'server',
    })
    const b = hk.key({
      url: 'https://x/hello',
      keySalt: 'client',
    })
    expect(a).not.toBe(b)
  })

  it('gives two identical calls without keySalt the same key (unchanged default behavior)', () => {
    const a = hk.key({
      url: 'https://x/hello',
    })
    const b = hk.key({
      url: 'https://x/hello',
    })
    expect(a).toBe(b)
  })

  it('differentiates by url as before, independent of keySalt', () => {
    const a = hk.key({
      url: 'https://x/hello?client=true',
    })
    const b = hk.key({
      url: 'https://x/hello',
    })
    expect(a).not.toBe(b)
  })
})
