import { transformSync } from '@babel/core'

import { config } from '#/devtools/babel-config'
import type { Nullish } from '#/libs/utility-types'

const commonjsPlugin =
  require.resolve('@babel/plugin-transform-modules-commonjs')

export type LoaderCallback = (
  err: Error | Nullish,
  code?: string,
  map?: any,
) => void

export type LoaderThis<T> = {
  resourcePath: string
  getOptions: () => T
  async: () => LoaderCallback
  callback: LoaderCallback
}

export type BabelLoaderOptions = {
  dir: string
  esmDirs: string[]
  isServer: boolean
  reactNativeVersion: string
  twrncConfig: object
  extractClassNameOutputPath: string
}

export function loader(this: LoaderThis<BabelLoaderOptions>, source: string) {
  const filename = this.resourcePath
  if (filename.endsWith('.d.ts')) {
    return source
  }

  const {
    dir,
    esmDirs,
    isServer,
    reactNativeVersion,
    twrncConfig,
    extractClassNameOutputPath,
  } = this.getOptions()
  const babelOptions = config({
    dir,
    target: 'nextjs',
    reactNativeVersion,
    twrncConfig,
    extractClassNameOutputPath,
    isServer,
  })

  const extraPlugins = []
  if (!esmDirs.some(d => filename.startsWith(d))) {
    extraPlugins.push(commonjsPlugin)
  }

  const r = transformSync(source, {
    ...babelOptions,
    plugins: [...babelOptions.plugins, ...extraPlugins],
    filename,
    babelrc: false,
    configFile: false,
    sourceMaps: false,
  })
  if (!r?.code) {
    this.callback(new Error('babel transform empty result'))
    return
  }

  this.callback(null, r.code, r.map)
  return
}
