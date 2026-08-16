import { parse } from 'graphql'
import { describe, expect, it } from 'vitest'

import { hk, normalizeGraphQLResponse } from '#/core/graphql/config'

const query = parse(/* graphql */ `
  query Hello {
    hello {
      message
    }
  }
`)

describe('graphql hk (hydration key)', () => {
  // Regression test for the /graphql production hydration mismatch: a
  // server-only and a 'use client' component calling the exact same query
  // used to collide on one dehydration key, so DehydrateTemplate's
  // dedup-by-key logic emitted only one <template> marker for both -
  // whichever group's SSR pass didn't render it raced on missing data.
  // keySalt exists so each group can opt into its own key.
  it('gives two identical calls with different keySalt different keys', () => {
    const a = hk.key({
      url: 'https://x/graphql',
      query,
      keySalt: 'server',
    })
    const b = hk.key({
      url: 'https://x/graphql',
      query,
      keySalt: 'client',
    })
    expect(a).not.toBe(b)
  })

  it('gives two identical calls without keySalt the same key (unchanged default behavior)', () => {
    const a = hk.key({
      url: 'https://x/graphql',
      query,
    })
    const b = hk.key({
      url: 'https://x/graphql',
      query,
    })
    expect(a).toBe(b)
  })

  it('keySalt is independent of variables/headers - only an explicit differentiator', () => {
    const a = hk.key({
      url: 'https://x/graphql',
      query,
      variables: {
        id: '1',
      },
      keySalt: 'client',
    })
    const b = hk.key({
      url: 'https://x/graphql',
      query,
      variables: {
        id: '1',
      },
      keySalt: 'client',
    })
    expect(a).toBe(b)
  })
})

describe('normalizeGraphQLResponse', () => {
  it('returns undefined for a nullish response', () => {
    expect(normalizeGraphQLResponse(undefined)).toBeUndefined()
  })

  it('defaults missing data/errors to undefined instead of null', () => {
    expect(normalizeGraphQLResponse({})).toEqual({
      data: undefined,
      errors: undefined,
    })
  })

  it('passes through data and errors when present', () => {
    expect(
      normalizeGraphQLResponse({
        data: {
          hello: 1,
        },
        errors: ['e'],
      }),
    ).toEqual({
      data: {
        hello: 1,
      },
      errors: ['e'],
    })
  })
})
