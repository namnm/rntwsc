import type { PluginObj } from '@babel/core'

import { shouldTranspile } from '#/devtools/babel-config/should-transpile'
import { get } from '#/libs/lodash'

const SERVER_ONLY_MODULES: string[] = ['next*/headers', 'server-*']

const wildcardToRegex = (pattern: string) => {
  pattern = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp(`^${pattern}$`)
}
const serverOnlyRegexes = SERVER_ONLY_MODULES.map(wildcardToRegex)
const isServerOnly = (importPath: string) =>
  serverOnlyRegexes.some(r => r.test(importPath))

export const browserValidationPlugin: PluginObj = {
  visitor: {
    // use program path to get plugin pass and perform some checks before traverse
    // also prioritize this plugin over others such as react compiler
    Program: (programPath, pluginPass) => {
      if (!shouldTranspile(pluginPass.filename)) {
        return
      }
      const isServer = get(pluginPass.opts, 'isServer')
      if (isServer) {
        return
      }

      programPath.traverse({
        ImportDeclaration: p => {
          const n = p.node
          if (n.importKind === 'type') {
            return
          }
          const importPath = n.source.value
          if (!isServerOnly(importPath)) {
            return
          }
          throw p.buildCodeFrameError(
            `"${importPath}" cannot be imported in a browser bundle, this module is only allowed in server code.`,
          )
        },
      })
    },
  },
}
