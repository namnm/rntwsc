import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clsx } from '#/core/tw/clsx'

describe('clsx', () => {
  it('joins plain string class names with a space', () => {
    expect(clsx('a', 'b')).toBe('a b')
  })

  it('flattens nested arrays of any depth', () => {
    expect(clsx(['a', ['b', ['c', 'd']]])).toBe('a b c d')
  })

  it('drops falsy values (false, undefined, null, empty string)', () => {
    expect(clsx('a', false, undefined, null, '', 'b')).toBe('a b')
  })

  it('merges conflicting tailwind classes, keeping the last one', () => {
    expect(clsx('p-2', 'p-4')).toBe('p-4')
  })

  it('returns an empty string when nothing is passed', () => {
    expect(clsx()).toBe('')
  })

  it('handles conditionally-included classes via && idiom', () => {
    const active = true
    const disabled = false
    expect(clsx('base', active && 'active', disabled && 'disabled')).toBe(
      'base active',
    )
  })

  describe('dev-mode validation', () => {
    let errSpy: ReturnType<typeof vi.spyOn>
    beforeEach(() => {
      errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    })
    afterEach(() => {
      errSpy.mockRestore()
    })

    it('logs an error (but does not throw) for a non-string className outside production', () => {
      vi.stubEnv('NODE_ENV', 'development')
      expect(() =>
        clsx([
          {
            notAString: true,
          } as any,
        ]),
      ).not.toThrow()
      expect(errSpy).toHaveBeenCalled()
      vi.unstubAllEnvs()
    })
  })
})
