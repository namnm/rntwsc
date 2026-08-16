import type { NextConfig } from 'next'

import { getAlias } from '#/devtools/babel-config/get-alias'
import type { BabelLoaderOptions } from '#/devtools/babel-loader'
import { glob } from '#/devtools/glob'
// @ts-ignore: will be generated
import publishedBrowserAlias from '#/devtools/next-config/browser-variants.json'
import { variantResolveAlias } from '#/devtools/variant-resolve-alias'
import { mapKeys, mapValues } from '#/libs/lodash'
import type { StrMap } from '#/libs/utility-types'

// we name it ts-loader to let nextjs not complain about its builtin
const babelLoaderPath = require.resolve('#/devtools/next-config/ts-loader.js')
const svgLoaderPath = require.resolve('#/devtools/next-config/svg-loader.js')

const resolveAlias = {
  'next-unchecked/headers': 'rntwsc/next/unchecked/headers',
  'next-unchecked/navigation': 'rntwsc/next/unchecked/navigation',
  'react-native': 'react-native-web',
  'react-native-svg': 'react-native-svg-web',
}

const transpilePackages: string[] = ['rntwsc']
const serverExternalPackages: string[] = []

type Options = Omit<BabelLoaderOptions, 'isServer'> & {
  repoRoot: string
  // Lets a second dev instance use its own build output instead of sharing
  // .next/, which deadlocks on Turbopack's persistent cache otherwise.
  distDir?: string
}

export const config = async (o: Options): Promise<NextConfig> => {
  const alias = getAlias(o.dir)
  const browsers = await glob('**/*.browser.{ts,tsx}', {
    cwd: o.repoRoot,
  })
  const browserAlias = {
    ...variantResolveAlias(alias, 'browser', browsers),
    ...publishedBrowserAlias,
  }

  return {
    webpack: buildWebpack(o, browserAlias),
    turbopack: buildTurbopack(o, browserAlias),
    transpilePackages,
    serverExternalPackages,
    typescript: {
      ignoreBuildErrors: true,
    },
    devIndicators: false,
    reactStrictMode: false,
    output: 'standalone',
    outputFileTracingRoot: o.repoRoot,
    ...(o.distDir
      ? {
          distDir: o.distDir,
        }
      : {}),
  }
}

const buildWebpack =
  (o: Options, browserAlias: StrMap<string>): NextConfig['webpack'] =>
  (c, { isServer }) => {
    c.resolve.alias = {
      ...c.resolve.alias,
      ...resolveAlias,
      // $ forces an exact match, fix:
      // rntwsc/dark-mode/config ->
      // rntwsc/dark-mode/index.browser/config
      ...mapKeys(isServer ? {} : browserAlias, (v, k) => `${k}$`),
    }

    c.module.rules.unshift({
      test: /\.tsx?$/,
      use: babelLoader(o, isServer),
    })

    // svg to react component
    c.module.rules.push({
      test: /\.svg$/,
      use: svgLoader(o),
    })

    return c
  }

const buildTurbopack = (
  o: Options,
  browserAlias: StrMap<string>,
): NextConfig['turbopack'] => ({
  root: o.repoRoot,
  resolveAlias: {
    ...resolveAlias,
    ...mapValues(browserAlias, v => ({
      browser: v,
    })),
  },
  rules: {
    '*.{ts,tsx}': [
      babelLoaderTurbopackRule(o, true),
      babelLoaderTurbopackRule(o, false),
    ],
    '*.svg': {
      loaders: [svgLoader(o)],
      as: '*.js',
    },
  },
})

const babelLoaderOption = (o: Options, isServer: boolean) => ({
  dir: o.dir,
  esmDirs: o.esmDirs,
  isServer,
  reactNativeVersion: o.reactNativeVersion,
  twrncConfig: o.twrncConfig,
  extractClassNameOutputPath: o.extractClassNameOutputPath,
})
const babelLoader = (o: Options, isServer: boolean) => ({
  loader: babelLoaderPath,
  options: babelLoaderOption(o, isServer),
})
const babelLoaderTurbopackRule = (o: Options, isServer: boolean) =>
  ({
    condition: {
      all: [
        isServer
          ? {
              not: 'browser',
            }
          : 'browser',
      ],
    },
    loaders: [babelLoader(o, isServer)],
  }) as any

const svgLoader = (o: Options) => ({
  loader: svgLoaderPath,
  options: {
    dimensions: false,
    esmDirs: o.esmDirs,
  },
})
