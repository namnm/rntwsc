import { describe, expect, it } from 'vitest'

import { jsonStable } from '#/libs/json-stable'

describe('jsonStable', () => {
  it('stringifies with keys sorted regardless of insertion order', () => {
    expect(
      jsonStable({
        b: 1,
        a: 2,
      }),
    ).toBe(
      jsonStable({
        a: 2,
        b: 1,
      }),
    )
    expect(
      jsonStable({
        b: 1,
        a: 2,
      }),
    ).toBe('{"a":2,"b":1}')
  })

  it('produces the same output for deeply nested objects with different key order', () => {
    const a = {
      outer: {
        z: 1,
        y: {
          b: 2,
          a: 1,
        },
      },
    }
    const b = {
      outer: {
        y: {
          a: 1,
          b: 2,
        },
        z: 1,
      },
    }
    expect(jsonStable(a)).toBe(jsonStable(b))
  })

  it('stringifies arrays preserving element order', () => {
    expect(jsonStable([3, 1, 2])).toBe('[3,1,2]')
  })

  it('falls back to a safe stringify for circular references instead of throwing', () => {
    const circular: Record<string, unknown> = {
      a: 1,
    }
    circular.self = circular
    expect(() => jsonStable(circular)).not.toThrow()
    const result = jsonStable(circular)
    expect(JSON.parse(result)).toMatchObject({
      a: 1,
    })
  })

  it('passes through stringify options such as space', () => {
    const result = jsonStable(
      {
        a: 1,
      },
      {
        space: 2,
      },
    )
    expect(result).toBe('{\n  "a": 1\n}')
  })
})
