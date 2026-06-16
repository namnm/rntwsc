/* eslint-disable no-restricted-imports */

import Image from 'react-native-fast-image'

import { createAnimatedComponent } from '@/core/tw/components/lib/create-animated-component'
import { isReanimated } from '@/core/tw/components/lib/is-reanimated'
import { renderReanimated } from '@/core/tw/components/lib/render-reanimated'
import { styleToProps } from '@/core/tw/components/lib/style-to-props'
import type { ImagePropsWocn } from '@/core/tw/components/without-class-name/image'

const styleProps = ['resizeMode']

export const ImageWocn = ({ src, ...props }: ImagePropsWocn) => {
  props = styleToProps(props, styleProps)
  const Component = isReanimated(props) ? AnimatedImage : Image

  const ty = typeof src
  const source =
    ty === 'string' || ty === 'number'
      ? {
          uri: src,
        }
      : src

  return renderReanimated(Component, {
    ...props,
    source,
  })
}

const AnimatedImage = createAnimatedComponent(Image)
