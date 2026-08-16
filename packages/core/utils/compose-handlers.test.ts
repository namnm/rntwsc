import { describe, expect, it, vi } from 'vitest'

import { composeHandlers, composeRef } from '#/core/utils/compose-handlers'

describe('composeHandlers', () => {
  it('composes two function props so both run, later-first', () => {
    const calls: string[] = []
    const a = {
      onPress: () => calls.push('a'),
    }
    const b = {
      onPress: () => calls.push('b'),
    }
    const composed = composeHandlers(a, b)
    composed.onPress()
    // b (the later props object) invoked first, then a
    expect(calls).toEqual(['b', 'a'])
  })

  it('forwards arguments to both composed handlers', () => {
    const seen: unknown[] = []
    const a = {
      onChange: (v: unknown) => seen.push(['a', v]),
    }
    const b = {
      onChange: (v: unknown) => seen.push(['b', v]),
    }
    composeHandlers(a, b).onChange('x')
    expect(seen).toEqual([
      ['b', 'x'],
      ['a', 'x'],
    ])
  })

  it('non-function props: the later prop object wins (plain override)', () => {
    const composed = composeHandlers(
      {
        disabled: false,
      },
      {
        disabled: true,
      },
    )
    expect(composed.disabled).toBe(true)
  })

  it('skips falsy props objects (e.g. a conditional spread that evaluated to false)', () => {
    const a = {
      onPress: () => 'a',
    }
    const composed = composeHandlers(a, false, undefined, null)
    expect(composed.onPress()).toBe('a')
  })

  it('merges across more than two props objects, preserving call order', () => {
    const calls: string[] = []
    const a = {
      onPress: () => calls.push('a'),
    }
    const b = {
      onPress: () => calls.push('b'),
    }
    const c = {
      onPress: () => calls.push('c'),
    }
    composeHandlers(a, b, c).onPress()
    expect(calls).toEqual(['c', 'b', 'a'])
  })

  it('composes the special-cased "ref" key via composeRef instead of function-call chaining', () => {
    const refA = {
      current: null as unknown,
    }
    const refB = vi.fn()
    const composed = composeHandlers(
      {
        ref: refA,
      },
      {
        ref: refB,
      },
    )
    const fn = composed.ref as (v: unknown) => void
    fn('el')
    expect(refA.current).toBe('el')
    expect(refB).toHaveBeenCalledWith('el')
  })
})

describe('composeRef', () => {
  it('returns b unchanged when a is falsy', () => {
    const b = vi.fn()
    expect(composeRef(undefined, b)).toBe(b)
  })

  it('returns a unchanged when b is falsy', () => {
    const a = vi.fn()
    expect(composeRef(a, undefined)).toBe(a)
  })

  it('assigns to both a callback ref and an object ref', () => {
    const objRef = {
      current: null as unknown,
    }
    const fnRef = vi.fn()
    const combined = composeRef(objRef, fnRef) as (v: unknown) => void
    combined('value')
    expect(objRef.current).toBe('value')
    expect(fnRef).toHaveBeenCalledWith('value')
  })

  it('is a no-op when both refs are falsy', () => {
    expect(composeRef(undefined, undefined)).toBeUndefined()
  })
})
