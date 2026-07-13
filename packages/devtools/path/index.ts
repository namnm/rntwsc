import path from 'node:path'

import type { Falsish, NonFalsish } from '@/core/ts-utils'
import { fs } from '@/devtools/fs'

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

export const stripInDir = (dir: string, abs: string) => {
  const relative = path.relative(dir, abs)
  if (path.isAbsolute(relative) || relative.startsWith('..')) {
    return abs
  }
  return relative.replace(/^[.\\/]+/, '')
}

export const isSameDir = (abs1: string, abs2: string | Falsish) =>
  !!abs2 && !path.relative(abs1, abs2)

export const isRelative = (abs: string) =>
  abs.startsWith('@/') || abs.startsWith('#') || abs.startsWith('.')

export const resolvePath = async (...paths: string[]) => {
  const f = path.join(...paths)
  if (!(await fs.exists(f))) {
    throw resolvePathErr(f)
  }
  return f
}

export const resolvePathSync = (...paths: string[]) => {
  const f = path.join(...paths)
  if (!fs.existsSync(f)) {
    throw resolvePathErr(f)
  }
  return f
}

export const resolvePathErr = (f: string) => new Error(`Cannot resolve: ${f}`)
