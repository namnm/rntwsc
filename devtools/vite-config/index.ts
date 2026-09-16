import type { PluginContext } from 'rolldown'
import type { Alias, Plugin, UserConfig } from 'vite'
import { mergeConfig } from 'vite'
import svgr from 'vite-plugin-svgr'

import { getAlias } from 'rntwsc/devtools/babel-config/get-alias'
import type { BabelLoaderOptions } from 'rntwsc/devtools/babel-loader'
import { loader as babelLoaderFn } from 'rntwsc/devtools/babel-loader'
import { fs } from 'rntwsc/devtools/fs'
import { glob } from 'rntwsc/devtools/glob'
// @ts-ignore: will be generated
import publishedBrowserAlias from 'rntwsc/devtools/next-config/browser-variants.json'
import { path } from 'rntwsc/devtools/path'
import { variantResolveAlias } from 'rntwsc/devtools/variant-resolve-alias'
// @ts-ignore: will be generated
import publishedNativeAlias from 'rntwsc/devtools/vite-config/native-variants.json'
// @ts-ignore: will be generated
import publishedWebAlias from 'rntwsc/devtools/vite-config/web-variants.json'
import { webpackLoaderToVitePlugin } from 'rntwsc/devtools/vite-config/webpack-loader-to-vite-plugin'
import { jsonSafe } from 'rntwsc/libs/json-safe'
import type { StrMap } from 'rntwsc/libs/utility-types'

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

type PackageJson = {
  name?: string
  exports?: unknown
}

// A plain require.resolve(specifier) walks the package's "exports" map
// with Node's own require conditions and always lands on a CJS build when
// one exists, even though a browser bundle wants the ESM one. Most
// packages expose "package.json" as an implicit subpath, so this is the
// fast path; some restrict "exports" to just "." (e.g. bezier-easing,
// color-rgba, tailwind-merge), which throws ERR_PACKAGE_PATH_NOT_EXPORTED
// here - fall back to resolving the main entry and walking up to the
// nearest package.json that actually names this package.
const readPackageJson = (
  specifier: string,
): { dir: string; json: PackageJson } | undefined => {
  try {
    const p = require.resolve(`${specifier}/package.json`)
    return {
      dir: path.dirname(p),
      json: require(p),
    }
  } catch {
    // fall through to the main-entry walk-up below
  }
  try {
    let dir = path.dirname(require.resolve(specifier))
    for (let i = 0; i < 5; i++) {
      const candidate = path.join(dir, 'package.json')
      if (fs.existsSync(candidate)) {
        const json = require(candidate) as PackageJson
        if (json.name === specifier) {
          return {
            dir,
            json,
          }
        }
      }
      const parent = path.dirname(dir)
      if (parent === dir) {
        break
      }
      dir = parent
    }
  } catch {
    // package isn't resolvable at all - handled by the caller's try/catch
  }
  return undefined
}

// Walks an exports["."] conditions tree (which can nest, e.g. ulidx's
// {node: {require, default}, default: {require, default}}) to find the
// leaf matching a priority-ordered list of condition names, skipping
// "types" (points at .d.ts, never a real module).
const findConditionEntry = (
  node: unknown,
  priority: string[],
): string | undefined => {
  if (typeof node === 'string') {
    return node
  }
  if (node && typeof node === 'object') {
    const obj = node as StrMap<unknown>
    for (const cond of priority) {
      if (cond in obj) {
        const found = findConditionEntry(obj[cond], priority)
        if (found) {
          return found
        }
      }
    }
  }
  return undefined
}

// A browser bundle wants "browser" over "import" over the conditionless
// "default" fallback; require.resolve()'s own choice (mirrored here to
// compare against) prefers "node" over "require" over "default".
const findEsmEntry = (root: unknown): string | undefined =>
  findConditionEntry(root, ['browser', 'import', 'default'])
const findCjsEntry = (root: unknown): string | undefined =>
  findConditionEntry(root, ['node', 'require', 'default'])

// Only packages with a real conditional exports map (import and require
// resolving to two different files) are at risk - most of
// rntwscRuntimeDeps either have no "exports" field at all (require.resolve
// already lands on their one real file) or ship a single unconditional
// build. See contribution/vite.md.
const autoEsmEntry = (json: PackageJson): string | undefined => {
  const exportsField = json.exports as StrMap<unknown> | string | undefined
  if (!exportsField || typeof exportsField === 'string') {
    return undefined
  }
  const root = '.' in exportsField ? exportsField['.'] : exportsField
  if (!root || typeof root === 'string') {
    return undefined
  }
  const esmEntry = findEsmEntry(root)
  const cjsEntry = findCjsEntry(root)
  return esmEntry && esmEntry !== cjsEntry ? esmEntry : undefined
}

// Runtime deps rntwsc's own source imports that no consumer declares
// directly - resolved from rntwsc's own install location, not the
// consumer's, so Vite's optimizer can still find and dedupe them without
// every playground repeating this list. Not auto-derived from rntwsc's
// own published package.json "dependencies" - that field is a flat dump
// of every dev/build-tooling dep too (eslint, typescript, stylelint, ...),
// since the dist publish never splits dependencies from devDependencies -
// so this stays a hand-picked subset of what's actually imported by
// browser-facing source. See contribution/vite.md.
const rntwscRuntimeDeps = [
  '@apollo/client',
  'accept-language',
  'bezier-easing',
  'color-rgba',
  'graphql',
  'i18next',
  'immer',
  'js-cookie',
  'json-stable-stringify',
  'json-stringify-safe',
  'lodash-es',
  'qs',
  'react-i18next',
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
      const resolved = readPackageJson(name)
      const esmEntry = resolved && autoEsmEntry(resolved.json)
      out[name] =
        resolved && esmEntry
          ? path.join(resolved.dir, esmEntry)
          : require.resolve(name)
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

// UserConfig fields here are deep-merged into vite-config's own output
// (arrays included, e.g. plugins/resolve.alias get concatenated, not
// replaced) - see contribution/vite.md. To overwrite instead of merge,
// await config() and edit the returned object directly.
type Options = Omit<BabelLoaderOptions, 'isServer'> &
  UserConfig & {
    repoRoot: string
  }

// no isServer split to thread through - a Vite SPA has no server target
export const config = async (o: Options): Promise<UserConfig> => {
  const {
    dir,
    repoRoot,
    esmDirs,
    reactNativeVersion,
    twrncConfig,
    extractClassNameOutputPath,
    ...viteConfigOverrides
  } = o

  const alias = getAlias(dir)
  const [browserFiles, webFiles] = await Promise.all([
    glob('**/*.browser.{ts,tsx}', {
      cwd: repoRoot,
    }),
    glob('**/*.web.{ts,tsx}', {
      cwd: repoRoot,
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
    dir,
    // rntwsc's own source must stay ESM here too - see contribution/vite.md
    esmDirs: [...esmDirs, rntwscRoot],
    isServer: false,
    reactNativeVersion,
    twrncConfig,
    extractClassNameOutputPath,
  }

  const base: UserConfig = {
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

  return mergeConfig(base, viteConfigOverrides) as UserConfig
}

const rolldownChecks = {
  // guarded with typeof module !== 'undefined' for Metro/CJS consumers
  commonJsVariableInEsm: false,
  pluginTimings: false,
}

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
