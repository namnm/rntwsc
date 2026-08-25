import { transform as defaultTransform } from '@react-native/metro-babel-transformer'
import { transform as svgTransform } from 'react-native-svg-transformer/react-native'

type Options = {
  filename: string
  src: string
}

export const transform = ({ filename, src, ...options }: Options) => {
  if (filename.endsWith('.svg')) {
    return svgTransform({
      filename,
      src,
      ...options,
    })
  }

  return defaultTransform({
    filename,
    src,
    ...options,
  })
}
