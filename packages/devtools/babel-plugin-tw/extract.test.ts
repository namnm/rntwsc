import { transformSync } from '@babel/core'
import { afterEach, describe, expect, it } from 'vitest'

import { twrncConfig } from '#/core/tw/twrnc-config'
import { twExtract } from '#/devtools/babel-plugin-tw/extract'
import { fs } from '#/devtools/fs'

const outputPath = '/tmp/rntwsc-tw-extract-round-trip.json'

// visitor.ts's Program handler always validates the full plugin-options
// schema (reactNativeVersion/twrncConfig/extractClassNameOutputPath),
// regardless of extract mode - twExtract's own `extractClassNameOutputPath`
// param is only used for writeTwExtractOutput in `done()`, not this.
const pluginOptions = (extractClassNameOutputPath: string) => ({
  reactNativeVersion: '0.86.0',
  twrncConfig,
  extractClassNameOutputPath,
})

const run = (
  code: string,
  visitor: object,
  extractClassNameOutputPath: string,
) =>
  transformSync(code, {
    filename: 'component.tsx',
    babelrc: false,
    configFile: false,
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    plugins: [
      [
        {
          visitor,
        },
        pluginOptions(extractClassNameOutputPath),
      ],
    ],
  })

describe('twExtract', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES
    fs.removeSync(outputPath)
  })

  it('collects tw`` class names into a minified mapping and writes it on done()', () => {
    process.env._MOCK_PLATFORM_OS = 'web'
    process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES = '1'
    // context() reads the *existing* extract output up front (to reuse
    // stable minified names across builds) - a real project always has this
    // file checked in already; a fresh one must exist too, even if empty
    fs.outputJsonSync(outputPath, {})

    const { visitor, done } = twExtract({
      extractClassNameOutputPath: outputPath,
      err: (path, msg) => path.buildCodeFrameError(msg),
    })
    run('const x = tw`bg-red-500 text-white`', visitor, outputPath)
    done()

    const written = fs.readJsonSync(outputPath)
    expect(Object.keys(written).sort()).toEqual(
      ['bg-red-500', 'text-white'].sort(),
    )
    // each class maps to a distinct short generated name
    expect(new Set(Object.values(written)).size).toBe(2)
  })

  it('assigns the same class name a stable value across repeated occurrences', () => {
    process.env._MOCK_PLATFORM_OS = 'web'
    process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES = '1'
    fs.outputJsonSync(outputPath, {})

    const { visitor, done } = twExtract({
      extractClassNameOutputPath: outputPath,
      err: (path, msg) => path.buildCodeFrameError(msg),
    })
    run(
      'const a = tw`bg-red-500`\nconst b = tw`bg-red-500 text-white`',
      visitor,
      outputPath,
    )
    done()

    const written = fs.readJsonSync(outputPath)
    // exactly 2 distinct classes were ever seen (bg-red-500, text-white),
    // not 3 - the repeated bg-red-500 didn't get assigned a second slot
    expect(Object.keys(written)).toHaveLength(2)
  })

  it('does not write anything when minification is disabled', () => {
    process.env._MOCK_PLATFORM_OS = 'web'
    // NEXT_PUBLIC_MINIFY_CLASS_NAMES intentionally left unset

    const { visitor, done } = twExtract({
      extractClassNameOutputPath: outputPath,
      err: (path, msg) => path.buildCodeFrameError(msg),
    })
    run('const x = tw`bg-red-500`', visitor, outputPath)
    done()

    expect(fs.existsSync(outputPath)).toBe(false)
  })
})
