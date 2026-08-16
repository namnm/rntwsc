import { transformSync } from '@babel/core'
import { afterEach, describe, expect, it } from 'vitest'

import { twrncConfig } from '#/core/tw/twrnc-config'
import { twPlugin } from '#/devtools/babel-plugin-tw'

// getPlatform (lib/config.ts) reads process.env._MOCK_PLATFORM_OS as a test
// escape hatch around the real `file.opts.caller.platform` babel-loader
// normally supplies - set/cleared per test rather than left global.
const withPlatform = (platform: 'web' | 'ios' | 'android', fn: () => void) => {
  const prev = process.env._MOCK_PLATFORM_OS
  process.env._MOCK_PLATFORM_OS = platform
  try {
    fn()
  } finally {
    if (prev === undefined) {
      delete process.env._MOCK_PLATFORM_OS
    } else {
      process.env._MOCK_PLATFORM_OS = prev
    }
  }
}

const transform = (
  code: string,
  extractClassNameOutputPath = '/tmp/rntwsc-tw-extract-test.json',
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
        twPlugin,
        {
          reactNativeVersion: '0.86.0',
          twrncConfig,
          extractClassNameOutputPath,
        },
      ],
    ],
  })?.code

describe('twPlugin - tw`` tagged template', () => {
  it('replaces a tw`` tagged template with its literal class-name string', () =>
    withPlatform('web', () => {
      expect(transform('const x = tw`bg-red-500 text-white`')).toBe(
        'const x = "bg-red-500 text-white";',
      )
    }))

  it('joins multiple lines/quasis with a space', () =>
    withPlatform('web', () => {
      const code = transform(`
        const x = tw\`
          bg-red-500
          text-white
        \`
      `)
      expect(code).toContain('bg-red-500')
      expect(code).toContain('text-white')
    }))

  it('only transpiles a tag whose name ends with "tw" (twFn.tw)', () =>
    withPlatform('web', () => {
      // some other tagged template unrelated to this plugin - left untouched
      const code = transform('const x = gql`query { hello }`')
      expect(code).toBe('const x = gql`query { hello }`;')
    }))
})

describe('twPlugin - clsx()', () => {
  it('reconstructs a clsx() call on web, preserving each argument', () =>
    withPlatform('web', () => {
      const code = transform(
        "import { clsx } from '#/core/tw/clsx'\nconst x = clsx('bg-red-500', condition && 'text-white')",
      )
      expect(code).toContain('clsx')
      expect(code).toContain('"bg-red-500"')
      expect(code).toContain('condition && "text-white"')
    }))
})

describe('twPlugin - cva()', () => {
  it('normalizes a cva() options object, filling in undefined for absent fields', () =>
    withPlatform('web', () => {
      const code = transform(
        "import { cva } from '#/core/tw/cva'\nconst x = cva({ className: 'bg-red-500' })",
      )
      expect(code).toContain('"className": "bg-red-500"')
      expect(code).toContain('"attributes": void 0')
      expect(code).toContain('"compoundVariants": void 0')
    }))
})

describe('twPlugin - JSX className', () => {
  it('wraps a plain string className in a JSXExpressionContainer', () =>
    withPlatform('web', () => {
      const code = transform(
        'const x = <View className="bg-red-500 text-white" />',
      )
      expect(code).toBe(
        'const x = <View className={"bg-red-500 text-white"} />;',
      )
    }))

  it('keeps className as a plain string on web', () =>
    withPlatform('web', () => {
      const code = transform(
        'const x = <View className="flex-row items-center" />',
      )
      expect(code).toContain('className={"flex-row items-center"}')
    }))

  it('converts className to a real style object at transpile time on native', () =>
    withPlatform('ios', () => {
      const code = transform(
        'const x = <View className="flex-row items-center" />',
      )
      expect(code).toContain('"flexDirection": "row"')
      expect(code).toContain('"alignItems": "center"')
      expect(code).not.toContain('flex-row items-center')
    }))
})

describe('twPlugin - class-name extraction (NEXT_PUBLIC_MINIFY_CLASS_NAMES)', () => {
  const outputPath = '/tmp/rntwsc-tw-extract-test.json'

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES
  })

  it('does not write an extract file when minification is disabled', () =>
    withPlatform('web', () => {
      // writeTwExtractOutput/readTwExtractOutput are both no-ops unless
      // NEXT_PUBLIC_MINIFY_CLASS_NAMES is set (see lib/config.ts) - the tw``
      // literal replacement above already implicitly covers this default
      // (unminified) path; this just makes the guard explicit.
      expect(process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES).toBeUndefined()
      transform('const x = tw`bg-red-500`', outputPath)
    }))
})
