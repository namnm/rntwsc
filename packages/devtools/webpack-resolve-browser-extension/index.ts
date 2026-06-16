import type { Resolver } from 'enhanced-resolve'

import { getAlias } from '@/devtools/babel-config/get-alias'
import { getBrowserVariant } from '@/devtools/babel-config/get-browser-variant'
import {
  shouldTranspile,
  shouldTranspileExtension,
} from '@/devtools/babel-config/should-transpile'
import { isRelative, path } from '@/nodejs/path'
import { get } from '@/shared/lodash'
import type { StrMap } from '@/shared/ts-utils'

export class ResolveBrowserExtension {
  alias: StrMap<string>
  browsers: StrMap<true>
  constructor(dir: string, browsers: string[]) {
    this.alias = getAlias(dir)
    this.browsers = browsers.reduce<StrMap<true>>((m, a) => {
      m[a] = true
      return m
    }, {})
  }

  apply = (resolver: Resolver) => {
    const target = resolver.ensureHook('resolve')

    resolver
      .getHook('beforeResolve')
      .tapAsync('BrowserExtensionResolver', (req, ctx, callback) => {
        try {
          const currentFilename = get(req.context, 'issuer')
          let importPath = req.request
          if (!currentFilename || !importPath) {
            return callback()
          }

          if (!shouldTranspile(importPath)) {
            return callback()
          }

          if (!isRelative(importPath)) {
            importPath = path
              .relative(currentFilename, importPath)
              .replace(shouldTranspileExtension, '')
          }

          const browserVariant = getBrowserVariant({
            alias: this.alias,
            browsers: this.browsers,
            currentFilename,
            importPath,
          })
          if (!browserVariant) {
            return callback()
          }

          resolver.doResolve(
            target,
            {
              ...req,
              request: browserVariant,
            },
            'BrowserExtensionResolver',
            ctx,
            callback,
          )
        } catch (err) {
          callback(err as Error)
        }
      })
  }
}
