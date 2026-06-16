import type { NextConfig } from 'next'

import { getAlias } from '@/devtools/babel-config/get-alias'
import { shouldTranspileExtension } from '@/devtools/babel-config/should-transpile'
import { cssExtractVariablesRegex } from '@/devtools/webpack-css-extract-variables/transform'
import { ResolveBrowserExtension } from '@/devtools/webpack-resolve-browser-extension'
import { repoRoot } from '@/nodejs/entrypoint/root'
import { glob } from '@/nodejs/glob'
import { jsonSafe } from '@/shared/json-safe'

const resolveAlias = {
  'next-unchecked/headers': '@/core/next/unchecked/headers',
  'next-unchecked/navigation': '@/core/next/unchecked/navigation',
  'react-native': 'react-native-web',
  'react-native-svg': 'react-native-svg-web',
}

type Options = {
  dir: string
}

export const config = async (o: Options): Promise<NextConfig> => ({
  ...(await webpack(o)),
  typescript: {
    ignoreBuildErrors: true,
  },
  devIndicators: false,
  reactStrictMode: false,
  output: 'standalone',
  outputFileTracingRoot: repoRoot,
})

const webpack = async (o: Options): Promise<NextConfig> => {
  const alias = getAlias(o.dir)
  const browsers = await glob('**/*.browser.{ts,tsx}')
  const cssExtractVariablesLoader =
    require.resolve('@/devtools/webpack-css-extract-variables')

  return {
    webpack: (c, { isServer }) => {
      c.resolve.alias = {
        ...c.resolve.alias,
        ...resolveAlias,
      }

      traverseWebpackRule(c.module.rules)

      // css extract variables
      c.module.rules.unshift({
        test: cssExtractVariablesRegex,
        type: 'javascript/auto',
        use: {
          loader: cssExtractVariablesLoader,
        },
      })

      // svg to react component
      c.module.rules.push({
        test: /\.svg$/,
        use: {
          loader: '@svgr/webpack',
          options: {
            dimensions: false,
          },
        },
      })

      if (!isServer) {
        c.resolve.plugins = c.resolve.plugins || []
        c.resolve.plugins.push(new ResolveBrowserExtension(o.dir, browsers))

        // since the loader is cached
        // we can not use one babel loader for both browser and server code
        // nextjs uses a different builtin babel loader
        // we will use this loader to handle browser-only code
        c.module.rules.push({
          test: shouldTranspileExtension,
          use: {
            loader: 'babel-loader',
            options: {
              caller: {
                isServer,
                browserOnly: true,
                alias: jsonSafe(alias),
                browsers: jsonSafe(browsers),
              },
            },
          },
        })
      }

      return c
    },
  }
}

const traverseWebpackRule = (rule: any): any => {
  if (!rule || typeof rule !== 'object') {
    return rule
  }

  if (Array.isArray(rule)) {
    return rule.map(traverseWebpackRule).filter(v => v)
  }

  for (const [k, v] of Object.entries(rule)) {
    // since the loader is cached
    // we can not use one babel loader for both browser and server code
    // thus can not remove nextjs built in babel loader
    // // remove babel loader since we already have above
    // if (typeof v === 'string' && /babel[/-]loader/.test(v)) {
    //   return
    // }

    // exclude css extract variables
    if (k === 'test' && typeof v === 'object' && v) {
      const regexps = (Array.isArray(v) ? v : [v]).filter(
        r => typeof r?.test === 'function',
      )
      const exts = ['css', 'scss'].map(e => `example.extract-variables.${e}`)
      if (exts.some(e => regexps.some(r => r.test(e)))) {
        rule.exclude = rule.exclude || []
        if (Array.isArray(rule.exclude)) {
          rule.exclude.push(cssExtractVariablesRegex)
        } else {
          rule.exclude = [rule.exclude, cssExtractVariablesRegex]
        }
      }
    }

    // already filtered out, remove this rule
    if (k === 'use' && !v) {
      return
    }

    rule[k] = traverseWebpackRule(v)
  }

  return rule
}
