import { describe, expect, it } from 'vitest'

import {
  qsIdSecret,
  qsIdSecretParse,
  qsParse,
  qsStableStringify,
} from '#/libs/qs'

describe('qsStableStringify', () => {
  it('sorts keys regardless of insertion order', () => {
    expect(
      qsStableStringify({
        b: 1,
        a: 2,
      }),
    ).toBe(
      qsStableStringify({
        a: 2,
        b: 1,
      }),
    )
    expect(
      qsStableStringify({
        b: 1,
        a: 2,
      }),
    ).toBe('a=2&b=1')
  })

  it('ignores a caller-supplied sort option (always sorted)', () => {
    // "sort" is Omit-ed from the exposed Options type, but verify the
    // stable-sort behavior can't be overridden if someone casts around it
    const out = qsStableStringify(
      {
        z: 1,
        a: 2,
      } as any,
      {
        sort: () => 0,
      } as any,
    )
    expect(out).toBe('a=2&z=1')
  })
})

describe('qsParse', () => {
  it('parses a query string back into an object', () => {
    expect(qsParse('a=2&b=1')).toEqual({
      a: '2',
      b: '1',
    })
  })
})

describe('qsIdSecret / qsIdSecretParse', () => {
  it('round-trips id/secret through encode then parse', () => {
    const encoded = qsIdSecret({
      id: 'abc',
      secret: 'xyz',
    })
    expect(qsIdSecretParse(encoded)).toEqual({
      id: 'abc',
      secret: 'xyz',
    })
  })

  it('returns undefined for a falsish input', () => {
    expect(qsIdSecretParse('')).toBeUndefined()
    expect(qsIdSecretParse(undefined)).toBeUndefined()
  })

  it('returns undefined when id or secret is missing', () => {
    expect(qsIdSecretParse('id=abc')).toBeUndefined()
    expect(qsIdSecretParse('secret=xyz')).toBeUndefined()
    expect(qsIdSecretParse('')).toBeUndefined()
  })

  it('returns undefined when id or secret is not a string (e.g. nested object)', () => {
    expect(qsIdSecretParse('id[foo]=bar&secret=xyz')).toBeUndefined()
  })
})
