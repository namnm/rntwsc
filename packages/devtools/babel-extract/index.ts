import { codeFrameColumns } from '@babel/code-frame'
import { parse } from '@babel/parser'
import type { NodePath, Visitor } from '@babel/traverse'
import traverse from '@babel/traverse'

import { twExtract } from '#/devtools/babel-plugin-tw/extract'
import { fs } from '#/devtools/fs'
import { globSync } from '#/devtools/glob'

type Options = {
  extractClassNameOutputPath: string
  repoRoot: string
  reactNativeVersion: string
  twrncConfig: object
  ignore?: string[]
}
type Extractor = {
  visitor: Visitor<any>
  done: () => void
}

export const extract = ({
  extractClassNameOutputPath,
  repoRoot,
  reactNativeVersion,
  twrncConfig,
  ignore = [],
}: Options) => {
  let currentCode = ''
  const err = (npath: NodePath, msg: string) => {
    const loc = npath.node?.loc
    if (!loc) {
      throw new Error(msg)
    }
    const frame = codeFrameColumns(
      currentCode,
      {
        start: loc.start,
        end: loc.end,
      },
      {
        highlightCode: true,
      },
    )
    return new Error(`${msg}\n${frame}`)
  }

  const extractors: Extractor[] = []
  if (process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES) {
    extractors.push(
      twExtract({
        err,
        extractClassNameOutputPath,
      }),
    )
  }

  // Test files use shapes the tw plugin can't statically transpile, so
  // they're excluded from the scan.
  const paths = globSync('**/*.{ts,tsx}', {
    cwd: repoRoot,
    ignore: ['**/*.test.{ts,tsx}', ...ignore],
  })

  const parserOption = {
    sourceType: 'module' as const,
    plugins: ['typescript' as const, 'jsx' as const],
  }
  for (const p of paths) {
    currentCode = fs.readFileSync(p, 'utf-8')
    // pluginPassOptsSchema requires this full shape or validation throws.
    // platform is omitted since extraction only needs the web class-name shape.
    const pluginPass = {
      filename: p,
      opts: {
        reactNativeVersion,
        twrncConfig,
        extractClassNameOutputPath,
      },
    }
    const ast = parse(currentCode, parserOption)
    for (const { visitor } of extractors) {
      traverse(ast, visitor as any, undefined, pluginPass)
    }
  }

  for (const { done } of extractors) {
    done()
  }
}
