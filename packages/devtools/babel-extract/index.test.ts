import os from 'node:os'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { twrncConfig } from '#/core/tw/twrnc-config'
import { extract } from '#/devtools/babel-extract'
import { fs } from '#/devtools/fs'
import { path } from '#/devtools/path'

// Regression tests for 3 real bugs found the first time extract() was ever
// actually run against the real monorepo - it had been wired nowhere, so
// tsc/unit tests stayed green while every real invocation failed. See
// docs/todo.md for the write-up.
describe('extract', () => {
  let dir: string
  let outputPath: string

  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'rntwsc-babel-extract-'))
    outputPath = path.join(dir, 'class-names.min.json')
    // context() reads the *existing* extract output up front - a real
    // project always has this file checked in, even as {}
    fs.outputJsonSync(outputPath, {})
    process.env._MOCK_PLATFORM_OS = 'web'
    process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES = '1'
  })

  afterEach(() => {
    fs.removeSync(dir)
    delete process.env._MOCK_PLATFORM_OS
    delete process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES
  })

  const run = (ignore?: string[]) =>
    extract({
      repoRoot: dir,
      extractClassNameOutputPath: outputPath,
      reactNativeVersion: '0.86.0',
      twrncConfig,
      ignore,
    })

  it('does not throw on a real tw`` usage - bug #1 was an always-empty pluginPass.opts, which failed the plugin-options schema before a single file was ever scanned', () => {
    fs.outputFileSync(
      path.join(dir, 'a.tsx'),
      'export const X = () => tw`bg-red-500`',
    )
    expect(() => run()).not.toThrow()
    const written = fs.readJsonSync(outputPath)
    expect(written['bg-red-500']).toBeDefined()
  })

  it("excludes .test.ts(x) files by default - bug #2 was a real .test.tsx with clsx('a', false) (a valid runtime shape babel-plugin-tw cannot statically transpile) aborting the whole-repo scan", () => {
    fs.outputFileSync(path.join(dir, 'a.test.tsx'), "clsx('a', false, 'b')")
    expect(() => run()).not.toThrow()
  })

  it('lets a caller exclude tooling source that name-collides with the cva/clsx heuristic - bug #3 was scanning babel-plugin-tw\'s own source whole-repo, where `twFn.cva(calleeName)` in its own implementation looks like a real cva() call to transpile (twFn.cva/clsx just checks the callee name ends with "cva"/"clsx")', () => {
    fs.outputFileSync(
      path.join(dir, 'tool/traverse-call-expression.ts'),
      'export const check = (calleeName) => { if (!twFn.cva(calleeName) && !twFn.clsx(calleeName)) { return } }',
    )
    expect(() => run()).toThrow(/expect simple object literal/)
    expect(() => run(['**/tool/**'])).not.toThrow()
  })
})
