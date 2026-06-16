import type { ConfigAPI, PluginObj } from '@babel/core'
import { z } from 'zod'

import { getBrowserVariant } from '@/devtools/babel-config/get-browser-variant'
import {
  getCallerAlias,
  getCallerBrowsers,
  getCallerIsServer,
  getIsServer,
} from '@/devtools/babel-config/is-server'
import { shouldTranspile } from '@/devtools/babel-config/should-transpile'
import type { StrMap } from '@/shared/ts-utils'

const pluginPassOptsSchema = z.object({
  alias: z.record(z.string(), z.string()).optional(),
  browsers: z.array(z.string()).optional(),
})

export const browserExtensionPlugin = (api: ConfigAPI): PluginObj => {
  const callerIsServer = getCallerIsServer(api)
  const callerAlias = getCallerAlias(api)
  const callerBrowsers = getCallerBrowsers(api)

  return {
    visitor: {
      // use program path to get plugin pass and perform some checks before traverse
      // also prioritize this plugin over others such as react compiler
      Program: (programPath, pluginPass) => {
        if (!shouldTranspile(pluginPass.filename)) {
          return
        }
        const isServer = getIsServer(pluginPass, callerIsServer)
        if (isServer) {
          return
        }

        const { alias: pluginPassAlias, browsers: pluginPassBrowsers } =
          pluginPassOptsSchema.parse(pluginPass.opts)
        const alias = pluginPassAlias || callerAlias
        const browsers = pluginPassBrowsers || callerBrowsers
        if (!alias || !browsers) {
          return
        }

        const browserMap = browsers.reduce<StrMap<true>>((m, a) => {
          m[a] = true
          return m
        }, {})
        const currentFilename = pluginPass.filename as string

        programPath.traverse({
          ImportDeclaration: p => {
            const n = p.node
            if (n.importKind === 'type') {
              return
            }
            const browserVariant = getBrowserVariant({
              alias,
              browsers: browserMap,
              currentFilename,
              importPath: n.source.value,
            })
            if (!browserVariant) {
              return
            }
            n.source.value = browserVariant
          },
        })
      },
    },
  }
}
