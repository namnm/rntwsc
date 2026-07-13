import type { Falsish } from '@/core/ts-utils'

export const shouldTranspileExtension = /\.tsx?/

export const shouldTranspile = (filename: string | Falsish) => {
  if (!filename) {
    return false
  }
  const node = filename.includes('node_modules')
  const rntwsc = filename.includes('@rntwsc')
  if (node && !rntwsc) {
    return false
  }
  return rntwsc || shouldTranspileExtension.test(filename)
}
