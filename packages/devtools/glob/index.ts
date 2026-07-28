import fg from 'fast-glob'
import type { Options } from 'globby'
import { globby, globbySync } from 'globby'

import { path } from '#/devtools/path'
import { omit } from '#/libs/lodash'

export type { Options as GlobbyOptions } from 'globby'
export { globby, globbySync } from 'globby'

export type GlobOptions = Omit<
  Options,
  'cwd' | 'absolute' | 'onlyDirectories' | 'onlyFiles'
> & {
  cwd: string | false
  relative?: true
  onlyFiles?: false
}

export const glob = (pattern: string, o: GlobOptions) =>
  globby(...opt(pattern, o)).then(a => map(a, o))

export const globSync = (pattern: string, o: GlobOptions) =>
  map(globbySync(...opt(pattern, o)), o)

const cwd = (o: GlobOptions) => (o.cwd !== false ? o.cwd : '')

const opt = (pattern: string, o: GlobOptions): [string, Options] => {
  const dir = cwd(o)
  if (dir) {
    if (process.platform === 'win32') {
      // https://github.com/sindresorhus/globby/issues/130
      // backslash \ on Windows not working
      pattern = fg.convertPathToPattern(dir) + '/' + pattern
    } else {
      pattern = path.join(dir, pattern)
    }
  }
  return [
    pattern,
    {
      cwd: dir || undefined,
      onlyFiles: true,
      gitignore: true,
      ...omit(o, ['cwd', 'relative']),
      onlyDirectories: o.onlyFiles === false ? true : false,
    },
  ]
}

const map = (paths: string[], o: GlobOptions) => {
  const dir = cwd(o)
  return !dir || !o.relative ? paths : paths.map(p => path.relative(dir, p))
}
