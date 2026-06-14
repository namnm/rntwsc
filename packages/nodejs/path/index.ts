import path from 'node:path'

import { repoRoot } from '@/nodejs/entrypoint/root'
import { fs } from '@/nodejs/fs'
import type { Falsish, NonFalsish } from '@/shared/ts-utils'

export { path }

export const isInDir = (
  dir: string,
  abs: string | Falsish,
): abs is NonFalsish<string> => {
  if (!abs) {
    return false
  }
  const relative = path.relative(dir, abs)
  if (path.isAbsolute(relative) || relative.startsWith('..')) {
    return false
  }
  return true
}
export const isInRepo = (abs: string | Falsish): abs is NonFalsish<string> =>
  isInDir(repoRoot, abs)
export const stripRepoRoot = (abs: string) => {
  if (!abs) {
    return abs
  }
  const relative = path.relative(repoRoot, abs)
  if (path.isAbsolute(relative) || relative.startsWith('..')) {
    return abs
  }
  return relative.replace(/^[.\\/]+/, '')
}

export const isSameDir = (abs1: string, abs2: string | Falsish) =>
  !!abs2 && !path.relative(abs1, abs2)
export const isRepoRoot = (abs: string | Falsish): abs is NonFalsish<string> =>
  isSameDir(repoRoot, abs)

export const isRelative = (abs: string) =>
  abs.startsWith('@/') || abs.startsWith('#') || abs.startsWith('.')

/**
 * Join paths then check using fs.exists just like {@link require.resolve}
 */
export const resolvePath = async (...paths: string[]) => {
  const f = path.join(...paths)
  if (!(await fs.exists(f))) {
    throw resolvePathErr(f)
  }
  return f
}

/**
 * Join paths then check using fs.existsSync just like {@link require.resolve}
 */
export const resolvePathSync = (...paths: string[]) => {
  const f = path.join(...paths)
  if (!fs.existsSync(f)) {
    throw resolvePathErr(f)
  }
  return f
}

export const resolvePathErr = (f: string) =>
  new Error(`Cannot resolve: ${path.relative(repoRoot, f) || '.'}`)
