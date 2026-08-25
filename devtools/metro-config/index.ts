import { getDefaultConfig } from '@react-native/metro-config'
import { makeMetroConfig } from '@rnx-kit/metro-config'
import MetroSymlinksResolver from '@rnx-kit/metro-resolver-symlinks'

import { fs } from 'rntwsc/devtools/fs'
import { path } from 'rntwsc/devtools/path'

const babelTransformerPath =
  require.resolve('rntwsc/devtools/metro-config/transformer.js')

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

const variantSuffixRe = /\.(native|ios|android)\.[jt]sx?$/
const extRe = /\.[jt]sx?$/

// Falls back to a sibling .browser file when no more specific native file
// exists, mirroring next-config's resolver - see docs/browser-variant.md.
const withBrowserFallback =
  (resolver: (...a: any[]) => any) =>
  (context: unknown, moduleName: string, platform: string | null) => {
    const resolution = resolver(context, moduleName, platform)
    if (resolution?.type !== 'sourceFile' || !resolution.filePath) {
      return resolution
    }
    const filePath: string = resolution.filePath
    if (variantSuffixRe.test(filePath)) {
      // metro already found a native-specific file, nothing to fall back from
      return resolution
    }
    const ext = filePath.match(extRe)?.[0]
    if (!ext) {
      return resolution
    }
    const browserPath = `${filePath.slice(0, -ext.length)}.browser${ext}`
    if (fs.existsSync(browserPath)) {
      return {
        type: 'sourceFile',
        filePath: browserPath,
      }
    }
    return resolution
  }

export const config = ({ dir, repoRoot }: Options) => {
  const defaultConfig = getDefaultConfig(dir)
  const { assetExts, sourceExts } = defaultConfig.resolver

  const symlinksResolver = MetroSymlinksResolver({
    resolver: 'enhanced-resolve',
  })

  return makeMetroConfig({
    projectRoot: dir,
    watchFolders: [repoRoot],
    resolver: {
      nodeModulesPaths: [
        path.resolve(dir, 'node_modules'),
        path.resolve(repoRoot, 'node_modules'),
      ],
      resolveRequest: withBrowserFallback(symlinksResolver),
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
