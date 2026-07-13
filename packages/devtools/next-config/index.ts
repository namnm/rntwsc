import type { NextConfig } from 'next'

import { mapKeys, mapValues } from '@/core/lodash'
import type { StrMap } from '@/core/ts-utils'
import { getAlias } from '@/devtools/babel-config/get-alias'
import type { BabelLoaderOptions } from '@/devtools/babel-loader'
import { glob } from '@/devtools/glob'
import { browserResolveAlias } from '@/devtools/next-config/browser-resolve-alias'
// @ts-ignore: will be generated
import publishedBrowserAlias from '@/devtools/next-config/browser-variants.json'

// we name it ts-loader to let next not complain about its builtin
const babelLoaderPath = require.resolve('@/devtools/next-config/ts-loader.js')
const svgLoaderPath = require.resolve('@/devtools/next-config/svg-loader.js')

const resolveAlias = {
  'next-unchecked/headers': '@rntwsc/core/next/unchecked/headers',
  'next-unchecked/navigation': '@rntwsc/core/next/unchecked/navigation',
  'react-native': 'react-native-web',
  'react-native-svg': 'react-native-svg-web',
}

const transpilePackages: string[] = ['@rntwsc/core']
const serverExternalPackages: string[] = []

type Options = Omit<BabelLoaderOptions, 'isServer'> & {
  repoRoot: string
}

export const config = async (o: Options): Promise<NextConfig> => {
  const alias = getAlias(o.dir)
  const browsers = await glob('**/*.browser.{ts,tsx}', {
    cwd: o.repoRoot,
  })
  const browserAlias = {
    ...browserResolveAlias(alias, browsers),
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
  }
}

const buildWebpack =
  (o: Options, browserAlias: StrMap<string>): NextConfig['webpack'] =>
  (c, { isServer }) => {
    c.resolve.alias = {
      ...c.resolve.alias,
      ...resolveAlias,
      // $ forces an exact match, fix:
      // @rntwsc/core/dark-mode/config ->
      // @rntwsc/core/dark-mode/index.browser/config
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
