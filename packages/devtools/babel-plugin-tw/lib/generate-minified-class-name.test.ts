import { describe, expect, it } from 'vitest'

import { generateMinifiedClassName } from '#/devtools/babel-plugin-tw/lib/generate-minified-class-name'

describe('generateMinifiedClassName', () => {
  it('starts with a single underscore for index 0', () => {
    expect(generateMinifiedClassName(0)).toBe('_')
  })

  it('produces single-character names for the first block (letters + underscore)', () => {
    expect(generateMinifiedClassName(1)).toBe('a')
    expect(generateMinifiedClassName(26)).toBe('z')
    expect(generateMinifiedClassName(27)).toBe('A')
  })

  it('produces a valid JS-identifier-safe character set only', () => {
    const validChar = /^[A-Za-z0-9_-]+$/
    for (const n of [0, 1, 25, 52, 53, 1000, 5000, 100000]) {
      expect(generateMinifiedClassName(n)).toMatch(validChar)
    }
  })

  it('never repeats a name across a large contiguous range', () => {
    const seen = new Set<string>()
    for (let n = 0; n < 5000; n++) {
      const name = generateMinifiedClassName(n)
      expect(seen.has(name)).toBe(false)
      seen.add(name)
    }
  })

  it('grows to multi-character names once the single-char pool is exhausted', () => {
    const p1Length = '_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
      .length
    expect(generateMinifiedClassName(p1Length - 1).length).toBe(1)
    expect(generateMinifiedClassName(p1Length).length).toBe(2)
  })

  it('is a deterministic pure function of its index', () => {
    expect(generateMinifiedClassName(12345)).toBe(
      generateMinifiedClassName(12345),
    )
  })
})
