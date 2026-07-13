import type { Node, NodePath, types as t } from '@babel/core'
import type { Platform } from 'react-native'

import type { ClassName } from '@/core/tw/class-name'
import { readTwExtractOutput } from '@/devtools/babel-plugin-tw/lib/config'
import type { Twrnc } from '@/devtools/babel-plugin-tw/lib/create-twrnc'
import { createTwrnc } from '@/devtools/babel-plugin-tw/lib/create-twrnc'
import type { WithPath } from '@/devtools/babel-plugin-tw/lib/path-to-js'
import { transpileClassName } from '@/devtools/babel-plugin-tw/lib/transpile-class-name'
import type { TwPluginOptions } from '@/devtools/babel-plugin-tw/visitor'
import type { StrMap } from '@/libs/utility-types'

export type Ctx = {
  programPath: NodePath<t.Program>
  rootPath: NodePath
  isInFunction: boolean
  platform: Platform['OS']
  calleeNode?: t.Expression
  twrnc: Twrnc
  min?: StrMap<string>
  extract?: (classNames: string[]) => void
  err: (path: NodePath<any>, msg: string) => Error
  // closure
  transpileClassName: (v: WithPath<string>) => ClassName | Node
}

export type ContextOptions = Pick<
  TwPluginOptions,
  'reactNativeVersion' | 'twrncConfig' | 'extractClassNameOutputPath'
> &
  Pick<Ctx, 'programPath' | 'rootPath' | 'platform' | 'calleeNode'> &
  Partial<Pick<Ctx, 'extract' | 'err'>>

const codeFrameErr = (path: NodePath, msg: string) =>
  path.buildCodeFrameError(msg)

export const context = ({
  reactNativeVersion,
  twrncConfig,
  extractClassNameOutputPath,
  programPath,
  rootPath,
  platform,
  calleeNode,
  extract,
  err = codeFrameErr,
}: ContextOptions) => {
  const twrnc = createTwrnc(twrncConfig, platform, reactNativeVersion)

  const ctx: Ctx = {
    programPath,
    rootPath,
    isInFunction: !!rootPath.getFunctionParent(),
    platform,
    calleeNode,
    twrnc,
    min: readTwExtractOutput(extractClassNameOutputPath),
    extract,
    err,
    transpileClassName: v => {
      const className = v.value
      if (typeof className !== 'string') {
        throw err(v.path, 'expect string literal')
      }
      return transpileClassName({
        className,
        ctx,
        path: v.path,
      })
    },
  }

  if (extract && platform !== 'web' && !process.env._MOCK_PLATFORM_OS) {
    throw err(programPath, `BUG: extract in ${platform}`)
  }

  return ctx
}
