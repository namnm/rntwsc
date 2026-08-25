import type { Falsish } from 'rntwsc/libs/utility-types'

export const shouldTranspileExtension = /\.tsx?/

export const shouldTranspile = (filename: string | Falsish) => {
  if (!filename) {
    return false
  }
  const node = filename.includes('node_modules')
  const rntwsc = filename.includes('rntwsc')
  if (node && !rntwsc) {
    return false
  }
  if (node && rntwsc) {
    return true
  }
  return shouldTranspileExtension.test(filename)
}
