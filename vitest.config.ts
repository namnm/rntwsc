import type * as BabelCore from '@babel/core'
import path from 'node:path'
import { configDefaults, defineConfig } from 'vitest/config'

const packagesDir = path.join(__dirname, './packages')
const core = (p: string) => path.join(packagesDir, 'core', p)

// Mirrors packages/devtools/next-config's browserResolveAlias for tests -
// see docs/contribution/dev.md "Running unit tests".
const browserVariantModules = [
  'cache',
  'dark-mode',
  'fetch',
  'graphql',
  'i18n',
  'navigation',
  'theme',
]
const browserVariants = browserVariantModules.flatMap(mod => [
  {
    find: new RegExp(`^#/core/${mod}$`),
    replacement: core(`${mod}/index.browser`),
  },
  {
    find: new RegExp(`^#/core/${mod}/index$`),
    replacement: core(`${mod}/index.browser`),
  },
])
browserVariants.push({
  find: /^#\/core\/responsive\/use-safe-area$/,
  replacement: core('responsive/use-safe-area.browser'),
})

const svgMockPath = path.join(__dirname, 'tests/mocks/svg.tsx')

// resolveId hook, not resolve.alias regex - see docs/contribution/dev.md
// "Running unit tests".
const svgMockPlugin = () => ({
  name: 'mock-svg-imports',
  enforce: 'pre' as const,
  resolveId: (source: string) => {
    if (source.endsWith('.svg')) {
      return svgMockPath
    }
    return null
  },
})

// Runs the real async-hook babel transform for client-rendered components -
// see docs/contribution/dev.md "Running unit tests" and docs/hydration.md.
const asyncHookTransformPlugin = () => {
  // Needs the tsx/cjs require hook for '#/' alias imports; loaded lazily
  // and cached since the hook must already be active when required.
  let asyncHookPlugin: object | undefined
  let babel: typeof BabelCore | undefined

  return {
    name: 'async-hook-transform',
    enforce: 'pre' as const,
    transform: (code: string, id: string) => {
      const [filename] = id.split('?')
      // Scoped to component dirs only, skips .test.ts(x) - see
      // docs/contribution/dev.md "Running unit tests" for why.
      const isComponentDir =
        filename.includes('/packages/core/components/') ||
        filename.includes('/packages/core/tw/components/')
      if (
        !isComponentDir ||
        !/\.tsx?$/.test(filename) ||
        filename.includes('node_modules') ||
        /\.test\.tsx?$/.test(filename)
      ) {
        return null
      }
      if (!asyncHookPlugin || !babel) {
        require('tsx/cjs')
        asyncHookPlugin = require(
          path.join(
            __dirname,
            'packages/devtools/babel-plugin-async-hook/index.ts',
          ),
        ).asyncHookPlugin
        babel = require('@babel/core')
      }

      const result = babel!.transformSync(code, {
        filename,
        babelrc: false,
        configFile: false,
        sourceMaps: true,
        presets: [
          require.resolve('@babel/preset-typescript'),
          [
            require.resolve('@babel/preset-react'),
            {
              runtime: 'automatic',
            },
          ],
        ],
        plugins: [
          [
            asyncHookPlugin,
            {
              isServer: false,
            },
          ],
        ],
      })
      if (!result?.code) {
        return null
      }
      return {
        code: result.code,
        map: result.map,
      }
    },
  }
}

export default defineConfig({
  plugins: [asyncHookTransformPlugin(), svgMockPlugin()],
  resolve: {
    alias: [
      ...browserVariants,
      // next-unchecked/* needs a real Next.js request/router context tests
      // don't have - routed to lightweight stand-ins (see tests/mocks).
      {
        find: 'next-unchecked/headers',
        replacement: path.join(
          __dirname,
          'tests/mocks/next-unchecked-headers.ts',
        ),
      },
      {
        find: 'next-unchecked/navigation',
        replacement: path.join(
          __dirname,
          'tests/mocks/next-unchecked-navigation.ts',
        ),
      },
      // Same web substitution next-config/metro-config apply at bundle time,
      // so component tests render against react-native-web instead of native RN.
      {
        find: 'react-native',
        replacement: 'react-native-web',
      },
      {
        find: 'react-native-svg',
        replacement: 'react-native-svg-web',
      },
      {
        find: '#',
        replacement: packagesDir,
      },
    ],
  },
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    // vitest's default include glob also matches e2e/*.spec.ts (Playwright's
    // own test()), so exclude it or vitest tries to run those specs itself.
    // dist-cli/ is a gitignored local build artifact (pnpm cli /
    // e2e-create-rntwsc-app) that duplicates create-rntwsc-app's own
    // *.test.ts files - configDefaults.exclude only covers dist/, not
    // dist-cli/, so it needs its own entry here.
    exclude: [...configDefaults.exclude, '**/tests/e2e/**', '**/dist-cli/**'],
  },
})
