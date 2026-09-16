/* eslint-disable no-restricted-imports */

import { Text } from 'react-native'
import Animated from 'react-native-reanimated'

import { isReanimated } from 'rntwsc/tw/components/lib/is-reanimated'
import { normalizePropsNative } from 'rntwsc/tw/components/lib/normalize-props-native'
import { renderReanimated } from 'rntwsc/tw/components/lib/render-reanimated'
import type { TextPropsWocn } from 'rntwsc/tw/components/without-class-name/text'

const styleProps = ['numberOfLines', 'selectable']

export const TextWocn = (props: TextPropsWocn) => {
  props = normalizePropsNative(props, styleProps)
  const Component = isReanimated(props) ? Animated.Text : Text

  return renderReanimated(Component, {
    suppressHighlighting: true,
    ...props,
  })
}
