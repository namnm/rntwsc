import { describe, expect, it } from 'vitest'

import { mergeDefault } from '#/core/utils/merge-default'

describe('mergeDefault', () => {
  it('fills in only keys that are undefined in value', () => {
    expect(
      mergeDefault(
        {
          a: 1,
          b: undefined as any,
        },
        {
          a: 99,
          b: 2,
        },
      ),
    ).toEqual({
      a: 1,
      b: 2,
    })
  })

  it('does not overwrite falsy-but-defined values (0, false, empty string)', () => {
    expect(
      mergeDefault(
        {
          a: 0,
          b: false,
          c: '',
        },
        {
          a: 1,
          b: true,
          c: 'x',
        },
      ),
    ).toEqual({
      a: 0,
      b: false,
      c: '',
    })
  })

  it('returns value unchanged when defaultValue is falsy', () => {
    const value = {
      a: 1,
    }
    expect(mergeDefault(value, undefined)).toEqual({
      a: 1,
    })
    expect(mergeDefault(value, null as any)).toEqual({
      a: 1,
    })
  })

  it('does not mutate the original value object', () => {
    const value = {
      a: undefined as any,
    }
    const result = mergeDefault(value, {
      a: 1,
    })
    expect(value.a).toBeUndefined()
    expect(result.a).toBe(1)
    expect(result).not.toBe(value)
  })

  it('ignores default keys not present in value at all vs undefined - both get filled', () => {
    expect(
      mergeDefault({} as any, {
        a: 1,
      }),
    ).toEqual({
      a: 1,
    })
  })
})
