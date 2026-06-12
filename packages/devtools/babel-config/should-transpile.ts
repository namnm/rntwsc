import type { Falsish } from '@/shared/ts-utils'

export const shouldTranspileExtension = /\.tsx?/

export const shouldTranspile = (filename: string | Falsish) => {
  if (!filename) {
    return false
  }
  if (filename.includes('node_modules') && !filename.includes('@rntwsc')) {
    return false
  }
  return shouldTranspileExtension.test(filename)
}
