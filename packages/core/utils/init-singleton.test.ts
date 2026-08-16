import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { initSingleton } from '#/core/utils/init-singleton'

// vi.fn() with no explicit type infers a Mock<Procedure | Constructable>,
// which initSingleton's generic (T1 extends StrMap<Function>) then reflects
// back onto the merged result ambiguously (not a plain callable). Casting
// the merged accessor through `any` at each call site keeps the test
// focused on runtime behavior, already verified correct by these
// assertions, without fighting vi.fn()'s own inference.
const callInit = (merged: any) => merged.init()

describe('initSingleton', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('merges init and getter functions into one object', () => {
    const init = vi.fn()
    const getter = vi.fn(() => 'value')
    const merged = initSingleton({
      init: {
        init,
      },
      getter: {
        getter,
      },
    })
    expect(typeof merged.init).toBe('function')
    expect(typeof merged.getter).toBe('function')
  })

  it('forwards calls and return values through to the underlying functions', () => {
    const initFn = vi.fn()
    const getterFn = vi.fn((x: number) => x * 2)
    const merged = initSingleton({
      init: {
        initFn,
      },
      getter: {
        getterFn,
      },
    })
    merged.initFn('a', 'b')
    expect(initFn).toHaveBeenCalledWith('a', 'b')
    expect(merged.getterFn(21)).toBe(42)
  })

  describe('in production', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'production')
    })

    it('does not warn even if a getter is called before init', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const merged = initSingleton({
        init: {
          init: vi.fn(),
        },
        getter: {
          getter: vi.fn(() => 'v'),
        },
      })
      merged.getter()
      callInit(merged)
      expect(errSpy).not.toHaveBeenCalled()
      errSpy.mockRestore()
    })
  })

  describe('outside production', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development')
    })

    it('does not warn immediately when a getter is called with no init call yet', () => {
      // the check is retroactive - it only fires once init actually runs,
      // see the next test
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const merged = initSingleton({
        init: {
          init: vi.fn(),
        },
        getter: {
          getter: vi.fn(() => 'v'),
        },
      })
      merged.getter()
      expect(errSpy).not.toHaveBeenCalled()
      errSpy.mockRestore()
    })

    it('warns once init is finally called after a getter already ran', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const merged = initSingleton({
        init: {
          init: vi.fn(),
        },
        getter: {
          getter: vi.fn(() => 'v'),
        },
      })
      merged.getter()
      callInit(merged)
      expect(errSpy).toHaveBeenCalledWith(
        expect.stringContaining('getter called before init'),
      )
      errSpy.mockRestore()
    })

    it('does not warn when init is called before any getter', () => {
      const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const merged = initSingleton({
        init: {
          init: vi.fn(),
        },
        getter: {
          getter: vi.fn(() => 'v'),
        },
      })
      callInit(merged)
      merged.getter()
      expect(errSpy).not.toHaveBeenCalled()
      errSpy.mockRestore()
    })
  })
})
