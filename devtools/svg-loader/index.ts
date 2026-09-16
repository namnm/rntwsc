import { transformSync } from '@babel/core'
import svgrLoader from '@svgr/webpack'

import type { LoaderCallback, LoaderThis } from 'rntwsc/devtools/babel-loader'

const commonjsPlugin =
  require.resolve('@babel/plugin-transform-modules-commonjs')

export type SvgLoaderOptions = {
  esmDirs: string[]
  [k: string]: unknown
}

export function loader(this: LoaderThis<SvgLoaderOptions>, source: string) {
  const filename = this.resourcePath
  const originalCallback = this.async()
  const { esmDirs, ...svgrOptions } = this.getOptions()

  const callback: LoaderCallback = (err, code, map) => {
    if (err) {
      originalCallback(err)
      return
    }
    if (esmDirs.some(d => filename.startsWith(d))) {
      originalCallback(null, code, map)
      return
    }

    const r = transformSync(code || '', {
      babelrc: false,
      configFile: false,
      filename,
      plugins: [commonjsPlugin],
      sourceMaps: false,
    })
    if (!r?.code) {
      originalCallback(new Error('babel transform empty result'))
      return
    }

    originalCallback(null, r.code)
  }

  const svgrThis = {
    ...this,
    getOptions: () => svgrOptions,
    async: () => callback,
    callback,
  }

  svgrLoader.call(svgrThis, source)
}
