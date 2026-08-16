import { describe, expect, it } from 'vitest'

import {
  defaultPackageId,
  toKebabCase,
  toPackageSegment,
  toPascalCase,
} from '#/cli/create-rntwsc-app/src/names'

describe('toKebabCase', () => {
  it('lowercases a simple word', () => {
    expect(toKebabCase('MyApp')).toBe('my-app')
  })

  it('splits on spaces', () => {
    expect(toKebabCase('My Cool App')).toBe('my-cool-app')
  })

  it('splits camelCase boundaries', () => {
    expect(toKebabCase('myCoolApp')).toBe('my-cool-app')
  })

  it('collapses runs of non-alphanumeric characters into one hyphen', () => {
    expect(toKebabCase('my___cool---app!!!')).toBe('my-cool-app')
  })

  it('trims leading/trailing hyphens produced by leading/trailing separators', () => {
    expect(toKebabCase('  --My App--  ')).toBe('my-app')
  })

  it('keeps digits', () => {
    expect(toKebabCase('App2')).toBe('app2')
  })

  it('falls back to "app" for an empty or fully-stripped input', () => {
    expect(toKebabCase('')).toBe('app')
    expect(toKebabCase('   ')).toBe('app')
    expect(toKebabCase('!!!')).toBe('app')
  })

  it('is idempotent - already-kebab input stays the same', () => {
    expect(toKebabCase('my-app')).toBe('my-app')
  })
})

describe('toPascalCase', () => {
  it('capitalizes each kebab segment and joins them', () => {
    expect(toPascalCase('my-cool-app')).toBe('MyCoolApp')
  })

  it('handles a single segment', () => {
    expect(toPascalCase('app')).toBe('App')
  })

  it('falls back to "App" for an empty input', () => {
    expect(toPascalCase('')).toBe('App')
  })

  it('ignores empty segments from a leading/trailing/doubled hyphen', () => {
    expect(toPascalCase('-my--app-')).toBe('MyApp')
  })

  it('preserves digits at the start of a segment', () => {
    expect(toPascalCase('app2-beta')).toBe('App2Beta')
  })
})

describe('toPackageSegment', () => {
  it('strips hyphens (invalid in a reverse-DNS segment)', () => {
    expect(toPackageSegment('my-cool-app')).toBe('mycoolapp')
  })

  it('falls back to "app" when nothing valid remains', () => {
    expect(toPackageSegment('---')).toBe('app')
  })

  it('keeps digits and lowercase letters', () => {
    expect(toPackageSegment('app2')).toBe('app2')
  })
})

describe('defaultPackageId', () => {
  it('prefixes with the com. reverse-DNS namespace', () => {
    expect(defaultPackageId('my-cool-app')).toBe('com.mycoolapp')
  })

  it('falls back to com.app for a name with nothing valid', () => {
    expect(defaultPackageId('---')).toBe('com.app')
  })
})
