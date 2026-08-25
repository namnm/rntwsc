import { writeTwExtractOutput } from 'rntwsc/devtools/babel-plugin-tw/lib/config'
import type { Ctx } from 'rntwsc/devtools/babel-plugin-tw/lib/context'
import { generateMinifiedClassName } from 'rntwsc/devtools/babel-plugin-tw/lib/generate-minified-class-name'
import { createVisitor } from 'rntwsc/devtools/babel-plugin-tw/visitor'
import type { StrMap } from 'rntwsc/libs/utility-types'

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
