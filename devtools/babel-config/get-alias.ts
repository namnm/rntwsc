import { readJson5Sync } from 'rntwsc/devtools/fs'
import { path } from 'rntwsc/devtools/path'
import type { StrMap } from 'rntwsc/libs/utility-types'

type Options = {
  relative?: true
}

export const getAlias = (dir: string, { relative }: Options = {}) => {
  const tsconfig = readJson5Sync(dir, './tsconfig.json')
  const paths: StrMap<string[]> = tsconfig.compilerOptions.paths

  return Object.entries(paths).reduce<StrMap<string>>((m, a) => {
    // the returned value will not have / at the end:
    // { '@': 'abs/path' }
    const [k, v] = [a[0], a[1][0]].map(p => p.replace(/\/\*$/, ''))
    m[k] = relative ? v : path.join(dir, v)
    return m
  }, {})
}

export const toAlias = (alias: StrMap<string>, abs: string) => {
  const sorted = Object.entries(alias).sort((a, b) => b[1].length - a[1].length)
  for (const [key, dir] of sorted) {
    if (!abs.startsWith(`${dir}/`)) {
      continue
    }
    const rel = abs
      // strip dir
      .slice(dir.length + 1)
      // strip ext
      .replace(/\.[^/.]+$/, '')
    return `${key}/${rel}`
  }
  throw new Error(`No alias found for ${abs}`)
}
