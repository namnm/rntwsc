import { describe, expect, it } from 'vitest'

import { hexToRgba } from '#/core/utils/hex-to-rgba'

describe('hexToRgba', () => {
  it('converts a hex color with the given alpha', () => {
    expect(hexToRgba('#ff0000', 0.5)).toBe('rgba(255,0,0,0.5)')
  })

  it('converts black and white', () => {
    expect(hexToRgba('#000000', 1)).toBe('rgba(0,0,0,1)')
    expect(hexToRgba('#ffffff', 1)).toBe('rgba(255,255,255,1)')
  })

  it('supports shorthand 3-digit hex', () => {
    expect(hexToRgba('#f00', 1)).toBe('rgba(255,0,0,1)')
  })

  it('ignores the source alpha channel in an 8-digit hex, using the passed alpha instead', () => {
    expect(hexToRgba('#ff000080', 0.2)).toBe('rgba(255,0,0,0.2)')
  })
})
