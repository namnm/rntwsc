import { getDefaultConfig } from '@react-native/metro-config'
import { makeMetroConfig } from '@rnx-kit/metro-config'
import MetroSymlinksResolver from '@rnx-kit/metro-resolver-symlinks'

import { path } from '#/devtools/path'

const babelTransformerPath =
  require.resolve('#/devtools/metro-config/transformer.js')

type Options = {
  dir: string
  repoRoot: string
}

const extraExts = [
  // those extensions will be loaded as javascript/auto
  // using our custom transformer in ./transfomer-ts.ts
  'svg',
  'css',
  'scss',
]

export const config = ({ dir, repoRoot }: Options) => {
  const defaultConfig = getDefaultConfig(dir)
  const { assetExts, sourceExts } = defaultConfig.resolver

  return makeMetroConfig({
    projectRoot: dir,
    watchFolders: [repoRoot],
    resolver: {
      nodeModulesPaths: [
        path.resolve(dir, 'node_modules'),
        path.resolve(repoRoot, 'node_modules'),
      ],
      resolveRequest: MetroSymlinksResolver({
        resolver: 'enhanced-resolve',
      }),
      assetExts: assetExts.filter(e => !extraExts.includes(e)),
      sourceExts: [...sourceExts, ...extraExts],
      // prioritize exports
      unstable_conditionNames: ['react-native', 'import', 'require', 'default'],
    },
    transformer: {
      babelTransformerPath,
      getTransformOptions: () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
  })
}
