import { twMerge as twMergeOriginal } from 'tailwind-merge'

import type { StrMap } from '@/core/ts-utils'
import { minifiedToTw, twToMinified } from '@/core/tw/config'

// on web the class names will be minified using babel-plugin-tw and postcss-rename
// remap to tw and merge then remap again to minified one

const split = /\s+/
const cache: StrMap<string> = {}

const twMergeMinified = (v: string) => {
  let r = cache[v]
  if (!r) {
    r = minify(twMergeOriginal(unminify(v)))
    cache[v] = r
  }
  return r
}

const unminify = (v: string) =>
  v
    .split(split)
    .map(k => minifiedToTw(k) || k)
    .join(' ')
const minify = (v: string) =>
  v
    .split(split)
    .map(k => twToMinified(k) || k)
    .join(' ')

export const twMergeWeb = process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES
  ? twMergeMinified
  : twMergeOriginal

// export for runtime style on web
export const twUnminifyWeb = process.env.NEXT_PUBLIC_MINIFY_CLASS_NAMES
  ? unminify
  : undefined
