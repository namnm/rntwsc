import type { ImageStyle } from 'react-native'

export type ImagePropsWocn = {
  // Only basic props; resize mode goes through class names in native.
  // Optimization and ratio, unlike Next.js Image, belong in the api backend.
  src: string
  style?: ImageStyle
}

export const ImageWocn = (props: ImagePropsWocn) => <img {...(props as any)} />
