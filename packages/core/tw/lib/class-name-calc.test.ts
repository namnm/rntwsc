import { describe, expect, it } from 'vitest'

import { classNameCalc } from '#/core/tw/lib/class-name-calc'

describe('classNameCalc', () => {
  it('parses a single plain number', () => {
    expect(classNameCalc('10')).toEqual({
      v: 10,
      unit: undefined,
    })
  })

  it('parses px as no unit (native default) but strips the suffix', () => {
    expect(classNameCalc('10px')).toEqual({
      v: 10,
      unit: undefined,
    })
  })

  it('parses vw/vh units', () => {
    expect(classNameCalc('100vw')).toEqual({
      v: 100,
      unit: 'vw',
    })
    expect(classNameCalc('50vh')).toEqual({
      v: 50,
      unit: 'vh',
    })
  })

  it('parses decimal numbers', () => {
    expect(classNameCalc('1.5')).toEqual({
      v: 1.5,
      unit: undefined,
    })
  })

  it('parses addition with correct operand shape', () => {
    expect(classNameCalc('100vw+10')).toEqual({
      l: {
        v: 100,
        unit: 'vw',
      },
      r: {
        v: 10,
        unit: undefined,
      },
      op: '+',
    })
  })

  it('parses subtraction', () => {
    expect(classNameCalc('100vw-10px')).toEqual({
      l: {
        v: 100,
        unit: 'vw',
      },
      r: {
        v: 10,
        unit: undefined,
      },
      op: '-',
    })
  })

  it('gives multiplication/division higher precedence than addition/subtraction', () => {
    // 10 + 2 * 3 -> 10 + (2 * 3)
    const result = classNameCalc('10+2*3')
    expect(result).toEqual({
      l: {
        v: 10,
        unit: undefined,
      },
      r: {
        l: {
          v: 2,
          unit: undefined,
        },
        r: {
          v: 3,
          unit: undefined,
        },
        op: '*',
      },
      op: '+',
    })
  })

  it('is left-associative for same-precedence operators', () => {
    // 10 - 2 - 3 -> (10 - 2) - 3
    const result = classNameCalc('10-2-3')
    expect(result).toEqual({
      l: {
        l: {
          v: 10,
          unit: undefined,
        },
        r: {
          v: 2,
          unit: undefined,
        },
        op: '-',
      },
      r: {
        v: 3,
        unit: undefined,
      },
      op: '-',
    })
  })

  it('treats underscores as spaces (tailwind arbitrary-value convention)', () => {
    expect(classNameCalc('100vw_-_10px')).toEqual(classNameCalc('100vw - 10px'))
  })

  it('returns undefined for an empty expression', () => {
    expect(classNameCalc('')).toBeUndefined()
  })

  it('returns undefined for a malformed expression (dangling operator)', () => {
    expect(classNameCalc('10+')).toBeUndefined()
  })

  it('returns undefined for an unparseable character', () => {
    expect(classNameCalc('10+abc')).toBeUndefined()
  })

  it('returns undefined when trailing tokens are left unconsumed', () => {
    // two atoms with no operator between them
    expect(classNameCalc('10 20')).toBeUndefined()
  })
})
