import os from 'node:os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getAlias, toAlias } from '#/devtools/babel-config/get-alias'
import { fs } from '#/devtools/fs'
import { path } from '#/devtools/path'

describe('getAlias', () => {
  let dir: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rntwsc-get-alias-'))
    fs.outputJsonSync(path.join(dir, 'tsconfig.json'), {
      compilerOptions: {
        paths: {
          '#/*': ['./packages/*'],
          '@/*': ['./src/*'],
        },
      },
    })
  })

  afterEach(() => {
    fs.removeSync(dir)
  })

  it('resolves each tsconfig path alias to an absolute directory by default', () => {
    const alias = getAlias(dir)
    expect(alias['#']).toBe(path.join(dir, 'packages'))
    expect(alias['@']).toBe(path.join(dir, 'src'))
  })

  it('keeps the alias target relative when relative: true is passed', () => {
    const alias = getAlias(dir, {
      relative: true,
    })
    expect(alias['#']).toBe('./packages')
    expect(alias['@']).toBe('./src')
  })

  it('strips the trailing /* from both the alias key and its target', () => {
    const alias = getAlias(dir)
    expect(Object.keys(alias)).toEqual(['#', '@'])
    expect(alias['#'].endsWith('/*')).toBe(false)
  })
})

describe('toAlias', () => {
  const alias = {
    '#': '/repo/packages',
    '@': '/repo/src',
  }

  it('converts an absolute path back into its shortest matching alias form', () => {
    expect(toAlias(alias, '/repo/packages/core/index.ts')).toBe('#/core/index')
  })

  it('strips the file extension', () => {
    expect(toAlias(alias, '/repo/src/pages/home.tsx')).toBe('@/pages/home')
  })

  it('prefers the longest matching alias dir when one is a prefix of another', () => {
    const nested = {
      '#': '/repo/packages',
      '#/core': '/repo/packages/core',
    }
    expect(toAlias(nested, '/repo/packages/core/index.ts')).toBe('#/core/index')
  })

  it('throws when no alias matches the given absolute path', () => {
    expect(() => toAlias(alias, '/elsewhere/foo.ts')).toThrow(
      /No alias found for/,
    )
  })
})
