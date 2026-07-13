import { mergeWith } from 'lodash-es'

import type { Falsish } from '@/core/ts-utils'

const splitWords = (v: string) =>
  v
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .split(/[^a-zA-Z0-9]+/)
    .filter(w => w)

export const camelCase = (v: string) =>
  splitWords(v)
    .map((w, i) =>
      i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase(),
    )
    .join('')

export const snakeCase = (v: string) =>
  splitWords(v)
    .map(w => w.toLowerCase())
    .join('_')

export const kebabCase = (v: string) =>
  splitWords(v)
    .map(w => w.toLowerCase())
    .join('-')

export const pascalCase = (s: string | Falsish) =>
  s
    ? splitWords(s)
        .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join('')
    : ''

export const capitalCase = (s: string | Falsish) =>
  s
    ? splitWords(s)
        .map(w => w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(' ')
    : ''

const withArray = (a: unknown, b: unknown) => {
  if (Array.isArray(a)) {
    return a.concat(b)
  }
  return
}
export const mergeWithArray = (...objects: object[]) =>
  mergeWith({}, ...objects, withArray)
