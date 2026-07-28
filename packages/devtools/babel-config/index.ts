import { getAlias } from '#/devtools/babel-config/get-alias'
import { asyncHookPlugin } from '#/devtools/babel-plugin-async-hook'
import { browserValidationPlugin } from '#/devtools/babel-plugin-browser-validation'
import { twPlugin } from '#/devtools/babel-plugin-tw'

const reactnativeWorkletsPlugin =
  require.resolve('react-native-worklets/plugin')
const reactCompilerPlugin = require.resolve('babel-plugin-react-compiler')
const typescriptPreset = require.resolve('@babel/preset-typescript')
const reactPreset = require.resolve('@babel/preset-react')

const moduleResolverPlugin = require.resolve('babel-plugin-module-resolver')
const reactNativePreset = require.resolve('@react-native/babel-preset')

type Options = {
  dir: string
  target: 'rn' | 'nextjs'
  reactNativeVersion: string
  twrncConfig: object
  extractClassNameOutputPath: string
  isServer?: boolean
}

export const config = ({
  dir,
  target,
  reactNativeVersion,
  twrncConfig,
  extractClassNameOutputPath,
  isServer,
}: Options) => {
  const twOptions = {
    reactNativeVersion,
    twrncConfig,
    extractClassNameOutputPath,
  }

  if (target === 'nextjs') {
    const isServerOptions = {
      isServer,
    }
    Object.assign(twOptions, isServerOptions)

    const plugins: any[] = [
      //
      [browserValidationPlugin, isServerOptions],
      [asyncHookPlugin, isServerOptions],
      [twPlugin, twOptions],
      reactnativeWorkletsPlugin,
    ]

    if (!isServer) {
      plugins.push(
        //
        reactCompilerPlugin,
      )
    }

    return {
      plugins,
      presets: [
        //
        typescriptPreset,
        [
          reactPreset,
          {
            runtime: 'automatic',
          },
        ],
      ],
      compact: false,
    }
  }

  const moduleResolverOptions = {
    alias: getAlias(dir, {
      relative: true,
    }),
  }

  const isServerOptions = {
    isServer: false,
  }
  Object.assign(twOptions, isServerOptions)

  return {
    plugins: [
      //
      [browserValidationPlugin, isServerOptions],
      [asyncHookPlugin, isServerOptions],
      [twPlugin, twOptions],
      reactCompilerPlugin,
      [moduleResolverPlugin, moduleResolverOptions],
      reactnativeWorkletsPlugin,
    ],
    presets: [
      //
      reactNativePreset,
    ],
    compact: false,
  }
}
