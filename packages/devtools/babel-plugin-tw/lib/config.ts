import type { PluginPass } from '@babel/core'
import type { Platform } from 'react-native'

import { fs } from '#/devtools/fs'
import { path } from '#/devtools/path'
import { get } from '#/libs/lodash'
import type { StrMap } from '#/libs/utility-types'

export const twFn = {
  tw: (v: string) => v.endsWith('tw'),
  cva: (v: string) => v.endsWith('cva'),
  clsx: (v: string) => v.endsWith('clsx'),
}

export const getPlatform = (pluginPass: PluginPass): Platform['OS'] =>
  (process.env._MOCK_PLATFORM_OS as any) ||
  get(pluginPass, 'file.opts.caller.platform') ||
  'web'

export const normalizeTwExtractOutputPath = (p: string) =>
  p.endsWith('.json') ? p : path.join(p, './src/codegen/class-names.min.json')

export const readTwExtractOutput = (p: string) => {
  if (!process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES) {
    return
  }
  p = normalizeTwExtractOutputPath(p)
  return fs.readJsonSync(p)
}

export const writeTwExtractOutput = (p: string, min: StrMap<string>) => {
  if (!process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES) {
    return
  }
  p = normalizeTwExtractOutputPath(p)
  return fs.writeJsonSync(p, min)
}
