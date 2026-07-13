import type { StrMap } from '@/core/ts-utils'
import { writeTwExtractOutput } from '@/devtools/babel-plugin-tw/lib/config'
import type { Ctx } from '@/devtools/babel-plugin-tw/lib/context'
import { generateMinifiedClassName } from '@/devtools/babel-plugin-tw/lib/generate-minified-class-name'
import { createVisitor } from '@/devtools/babel-plugin-tw/visitor'

type Options = Pick<Ctx, 'err'> & {
  extractClassNameOutputPath: string
}

export const twExtract = ({ err, extractClassNameOutputPath }: Options) => {
  const minified: StrMap<string> = {}
  let n = 0

  const extract = (classNames: string[]) => {
    for (const c of classNames) {
      minified[c] = generateMinifiedClassName(n)
      n++
    }
  }

  return {
    visitor: createVisitor({
      extract,
      err,
    }),
    done: () => writeTwExtractOutput(extractClassNameOutputPath, minified),
  }
}
