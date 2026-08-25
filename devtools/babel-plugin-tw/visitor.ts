import type { PluginPass, Visitor } from '@babel/core'
import { z } from 'zod'

import { shouldTranspile } from 'rntwsc/devtools/babel-config/should-transpile'
import { getPlatform } from 'rntwsc/devtools/babel-plugin-tw/lib/config'
import type {
  ContextOptions,
  Ctx,
} from 'rntwsc/devtools/babel-plugin-tw/lib/context'
import { traverseCallExpression } from 'rntwsc/devtools/babel-plugin-tw/lib/traverse-call-expression'
import { traverseJSXOpeningElement } from 'rntwsc/devtools/babel-plugin-tw/lib/traverse-jsx-opening-element'
import { traverseTaggedTemplateExpression } from 'rntwsc/devtools/babel-plugin-tw/lib/traverse-tagged-template-expression'

const pluginPassOptsSchema = z.object({
  reactNativeVersion: z.string(),
  twrncConfig: z.record(z.string(), z.any()),
  extractClassNameOutputPath: z.string(),
})
export type TwPluginOptions = z.infer<typeof pluginPassOptsSchema>

export type CreateVisitorOptions = Partial<Pick<Ctx, 'extract' | 'err'>>
export type TraverseOptions = Omit<ContextOptions, 'rootPath' | 'calleeNode'>

export const createVisitor = ({
  extract,
  err,
}: CreateVisitorOptions = {}): Visitor<PluginPass> => ({
  // use program path to get plugin pass and perform some checks before traverse
  // also prioritize this plugin over others such as react compiler
  Program: (programPath, pluginPass) => {
    if (!shouldTranspile(pluginPass.filename)) {
      return
    }

    const { reactNativeVersion, twrncConfig, extractClassNameOutputPath } =
      pluginPassOptsSchema.parse(pluginPass.opts)
    const o: TraverseOptions = {
      reactNativeVersion,
      twrncConfig,
      extractClassNameOutputPath,
      programPath,
      platform: getPlatform(pluginPass),
      extract,
      err,
    }
    programPath.traverse({
      JSXOpeningElement: p => traverseJSXOpeningElement(p, o),
      CallExpression: p => traverseCallExpression(p, o),
      TaggedTemplateExpression: p => traverseTaggedTemplateExpression(p, o),
    })
  },
})
