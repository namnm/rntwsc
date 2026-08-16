import { beforeAll, describe, expect, it } from 'vitest'

import {
  getDefaultLangUntyped,
  getDefaultLocaleUntyped,
  getDirectionUntyped,
  getLangsUntyped,
  getLangUntyped,
  getLocalesUntyped,
  getLocaleUntyped,
  initI18n,
  isRtlLangUntyped,
  isValidLangUntyped,
  isValidLocaleUntyped,
} from '#/core/i18n/config'

describe('i18n config', () => {
  beforeAll(() => {
    initI18n(['en-US', 'ja-JP', 'ar-SA'], {})
  })

  it('exposes the configured locales and langs', () => {
    expect(getLocalesUntyped()).toEqual(['en-US', 'ja-JP', 'ar-SA'])
    expect(getLangsUntyped()).toEqual(['en', 'ja', 'ar'])
  })

  it('treats the first locale as the default', () => {
    expect(getDefaultLocaleUntyped()).toBe('en-US')
    expect(getDefaultLangUntyped()).toBe('en')
  })

  it('validates locales/langs against the configured set', () => {
    expect(isValidLocaleUntyped('ja-JP')).toBe(true)
    expect(isValidLocaleUntyped('fr-FR')).toBe(false)
    expect(isValidLocaleUntyped(undefined)).toBe(false)
    expect(isValidLangUntyped('ja')).toBe(true)
    expect(isValidLangUntyped('fr')).toBe(false)
  })

  it('derives lang from a valid locale (first two chars)', () => {
    expect(getLangUntyped('ja-JP')).toBe('ja')
  })

  it('falls back to the default lang for an invalid locale', () => {
    expect(getLangUntyped('fr-FR')).toBe('en')
    expect(getLangUntyped(undefined)).toBe('en')
  })

  it('maps a valid lang back to its configured locale', () => {
    expect(getLocaleUntyped('ja')).toBe('ja-JP')
  })

  it('falls back to the default locale for an invalid lang', () => {
    expect(getLocaleUntyped('fr')).toBe('en-US')
  })

  it('identifies known RTL languages', () => {
    expect(isRtlLangUntyped('ar')).toBe(true)
    expect(isRtlLangUntyped('en')).toBe(false)
    expect(isRtlLangUntyped(undefined)).toBe(false)
  })

  it('derives direction from lang', () => {
    expect(getDirectionUntyped('ar')).toBe('rtl')
    expect(getDirectionUntyped('en')).toBe('ltr')
    expect(getDirectionUntyped('ja')).toBe('ltr')
  })
})
