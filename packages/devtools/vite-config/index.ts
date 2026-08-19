import type { PluginContext } from 'rolldown'
import type { Alias, Plugin, UserConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

import { getAlias } from '#/devtools/babel-config/get-alias'
import type { BabelLoaderOptions } from '#/devtools/babel-loader'
import { loader as babelLoaderFn } from '#/devtools/babel-loader'
import { fs } from '#/devtools/fs'
import { glob } from '#/devtools/glob'
// @ts-ignore: will be generated
import publishedBrowserAlias from '#/devtools/next-config/browser-variants.json'
import { path } from '#/devtools/path'
import { variantResolveAlias } from '#/devtools/variant-resolve-alias'
// @ts-ignore: will be generated
import publishedNativeAlias from '#/devtools/vite-config/native-variants.json'
// @ts-ignore: will be generated
import publishedWebAlias from '#/devtools/vite-config/web-variants.json'
import { webpackLoaderToVitePlugin } from '#/devtools/vite-config/webpack-loader-to-vite-plugin'
import { jsonSafe } from '#/libs/json-safe'
import type { StrMap } from '#/libs/utility-types'

// two levels above this file is the rntwsc package root - see contribution/build.md
const rntwscRoot = path.join(__dirname, '../../')

// see contribution/vite.md
const resolvePublishedSpecifier = (specifier: string): string | undefined => {
  const rel = specifier.replace(/^rntwsc\//, '')
  for (const ext of ['.tsx', '.ts']) {
    const p = path.join(rntwscRoot, `${rel}${ext}`)
    if (fs.existsSync(p)) {
      return p
    }
  }
  return undefined
}

const resolveEach = (m: StrMap<string>): StrMap<string> => {
  const out: StrMap<string> = {}
  for (const [k, v] of Object.entries(m)) {
    const resolved = resolvePublishedSpecifier(v)
    if (resolved) {
      out[k] = resolved
    }
  }
  return out
}

const resolveDir = (specifier: string): string =>
  path.dirname(require.resolve(`${specifier}/package.json`))

// twrnc ships a real ESM build (exports["."].import), but a plain
// require.resolve() always honors the "require" condition, landing on the
// CJS build - rntwsc/libs/twrnc/index.ts's `export * from 'twrnc'` is a
// wildcard re-export of that CJS module, which rolldown can't always
// detect needs interop, silently dropping named exports like `create`.
// Alias straight to the ESM entry instead. See contribution/vite.md.
const resolveTwrncEsm = (): string =>
  path.join(resolveDir('twrnc'), 'dist/esm/index.js')

// Runtime deps rntwsc's own source imports that no consumer declares
// directly - resolved from rntwsc's own install location, not the
// consumer's, so Vite's optimizer can still find and dedupe them without
// every playground repeating this list. See contribution/vite.md.
const rntwscRuntimeDeps = [
  'bezier-easing',
  'color-rgba',
  'immer',
  'js-cookie',
  'json-stable-stringify',
  'json-stringify-safe',
  'lodash-es',
  'react-native-css-animations',
  'tailwind-merge',
  'twrnc',
  'ulidx',
  'use-immer',
]

const rntwscRuntimeDepAlias = (): StrMap<string> => {
  const out: StrMap<string> = {}
  for (const name of rntwscRuntimeDeps) {
    try {
      out[name] = name === 'twrnc' ? resolveTwrncEsm() : require.resolve(name)
    } catch {
      // not every consumer's build pulls in every one of these
    }
  }
  return out
}

// see web-variant.md - currently empty
const nativeSharedModules: string[] = []

// react-native-web has no equivalent for this native codegen helper
const nullModulePath = path.join(__dirname, 'null.ts')

// see contribution/vite.md's ".web.js resolution" section
const webExtensions = [
  '.web.mjs',
  '.web.js',
  '.web.mts',
  '.web.ts',
  '.web.jsx',
  '.web.tsx',
  '.mjs',
  '.js',
  '.mts',
  '.ts',
  '.jsx',
  '.tsx',
  '.json',
]

// matches Metro/webpack's svg-loader: default export is the component
const autoSvgReactPlugin = (): Plugin => ({
  name: 'rntwsc-auto-svg-react',
  enforce: 'pre',
  resolveId: {
    filter: {
      id: /\.svg$/,
    },
    handler(this: PluginContext, source, importer) {
      if (!importer) {
        return
      }
      return this.resolve(`${source}?react`, importer, {
        skipSelf: true,
      })
    },
  },
})

type Options = Omit<BabelLoaderOptions, 'isServer'> & {
  repoRoot: string
}

// no isServer split to thread through - a Vite SPA has no server target
export const config = async (o: Options): Promise<UserConfig> => {
  const alias = getAlias(o.dir)
  const [browserFiles, webFiles] = await Promise.all([
    glob('**/*.browser.{ts,tsx}', {
      cwd: o.repoRoot,
    }),
    glob('**/*.web.{ts,tsx}', {
      cwd: o.repoRoot,
    }),
  ])

  const nativeOverrideAlias: StrMap<string> = {}
  for (const m of nativeSharedModules) {
    const key = `rntwsc/${m}`
    const specifier = (publishedNativeAlias as StrMap<string>)[key]
    const resolved = specifier && resolvePublishedSpecifier(specifier)
    if (resolved) {
      nativeOverrideAlias[key] = resolved
    }
  }

  // see web-variant.md's fallback-resolution priority order
  const webAlias: StrMap<string> = {
    ...variantResolveAlias(alias, 'browser', browserFiles),
    ...resolveEach(publishedBrowserAlias),
    ...nativeOverrideAlias,
    ...variantResolveAlias(alias, 'web', webFiles),
    ...resolveEach(publishedWebAlias),
  }

  const runtimeDepAlias = rntwscRuntimeDepAlias()

  // see contribution/turbopack.md's dark-mode-config example
  const resolveAlias: Alias[] = [
    {
      find: /^react-native\/Libraries\/Utilities\/codegenNativeComponent$/,
      replacement: nullModulePath,
    },
    {
      find: 'react-native',
      replacement: resolveDir('react-native-web'),
    },
    {
      find: 'react-native-svg',
      replacement: resolveDir('react-native-svg-web'),
    },
    // must come before the generic aliases below - first match wins
    ...Object.entries(webAlias).map(([key, replacement]) => ({
      find: new RegExp(`^${escapeRegExp(key)}$`),
      replacement,
    })),
    ...Object.entries(runtimeDepAlias).map(([key, replacement]) => ({
      find: new RegExp(`^${escapeRegExp(key)}$`),
      replacement,
    })),
    ...Object.entries(alias).map(([find, replacement]) => ({
      find,
      replacement,
    })),
  ]

  const babelLoaderOptions: BabelLoaderOptions = {
    dir: o.dir,
    // rntwsc's own source must stay ESM here too - see contribution/vite.md
    esmDirs: [...o.esmDirs, rntwscRoot],
    isServer: false,
    reactNativeVersion: o.reactNativeVersion,
    twrncConfig: o.twrncConfig,
    extractClassNameOutputPath: o.extractClassNameOutputPath,
  }

  return {
    resolve: {
      alias: resolveAlias,
      // avoids a duplicate i18next instance - see contribution/vite.md
      dedupe: ['i18next', 'react-i18next'],
      // matches Metro/webpack's .web.js priority - see contribution/vite.md
      extensions: webExtensions,
    },
    plugins: [
      webpackLoaderToVitePlugin(
        'rntwsc-babel',
        /\.tsx?$/,
        babelLoaderFn,
        () => babelLoaderOptions,
      ),
      autoSvgReactPlugin(),
      svgr({
        svgrOptions: {
          dimensions: false,
        },
      }),
    ],
    // rntwsc ships raw .ts/.tsx - see contribution/build.md
    optimizeDeps: {
      // native-only, unloadable in a browser - see contribution/vite.md
      exclude: ['rntwsc', 'react-native-reanimated', 'react-native-worklets'],
      // react/react-dom need the same CJS interop as rntwsc's own source -
      // see contribution/vite.md. use-sync-external-store is react-i18next's
      // CJS shim, needed by rntwsc's own i18n - without prebundling it, the
      // browser loads it as raw ESM and gets no named exports.
      include: [
        'react',
        'react-dom',
        'use-sync-external-store',
        'use-sync-external-store/shim',
        ...Object.keys(runtimeDepAlias),
      ],
      rolldownOptions: {
        // the scanner has its own resolver - see contribution/vite.md
        resolve: {
          extensions: webExtensions,
        },
        checks: rolldownChecks,
      },
    },
    define: {
      'process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES': jsonSafe(
        process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES || '',
      ),
      // Vite doesn't polyfill Node's `global` the way CRA/webpack did
      global: 'globalThis',
    },
    server: {
      port: 3000,
      host: true,
      open: true,
    },
    build: {
      chunkSizeWarningLimit: Infinity,
      rolldownOptions: {
        checks: rolldownChecks,
      },
    },
  }
}

const rolldownChecks = {
  // guarded with typeof module !== 'undefined' for Metro/CJS consumers
  commonJsVariableInEsm: false,
  pluginTimings: false,
}

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
