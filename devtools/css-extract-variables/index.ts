import { generate, parse, walk } from 'css-tree'
import { compileString } from 'sass'

import { fs } from 'rntwsc/devtools/fs'
import { glob } from 'rntwsc/devtools/glob'
import type { StrMap } from 'rntwsc/libs/utility-types'

const extractVariablesRegex = /\.extract-variables\.(css|scss)$/

const toVars = (src: string, filename: string): StrMap<string> => {
  if (filename.endsWith('.scss')) {
    src = compileString(src).css
  }

  const ast = parse(src)
  const vars: StrMap<string> = {}

  walk(ast, {
    visit: 'Declaration',
    enter: n => {
      if (
        n.type === 'Declaration' &&
        typeof n.property === 'string' &&
        n.property.startsWith('--')
      ) {
        vars[n.property] = generate(n.value).trim()
      }
    },
  })

  return vars
}

export const cssExtractVariables = async (dir: string, gitignore = true) => {
  const files = await glob('**/*.extract-variables.{css,scss}', {
    cwd: dir,
    gitignore,
  })

  await Promise.all(
    files.map(async abs => {
      const src = await fs.readFile(abs, 'utf8')
      const vars = toVars(src, abs)
      const dst = abs.replace(extractVariablesRegex, '.local.json')
      await fs.outputJson(dst, vars, {
        spaces: 2,
      })
    }),
  )
}
