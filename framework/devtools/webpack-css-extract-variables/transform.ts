import * as csstree from 'css-tree'
import * as sass from 'sass'

import { jsonSafe } from '@/shared/json-safe'
import type { StrMap } from '@/shared/ts-utils'

export const cssExtractVariablesRegex = /\.extract-variables\.s?css$/

export const transformCssExtractVariables = (src: string, filename: string) => {
  if (filename.endsWith('.scss')) {
    src = sass.compileString(src).css
  }
  return `export default ${jsonSafe(toJs(src))}`
}

const toJs = (src: string): StrMap<string> => {
  const ast = csstree.parse(src)
  const vars: StrMap<string> = {}

  csstree.walk(ast, {
    visit: 'Declaration',
    enter: n => {
      if (
        n.type === 'Declaration' &&
        typeof n.property === 'string' &&
        n.property.startsWith('--')
      ) {
        const varName = n.property
        const varValue = csstree.generate(n.value).trim()
        vars[varName] = varValue
      }
    },
  })

  return vars
}
