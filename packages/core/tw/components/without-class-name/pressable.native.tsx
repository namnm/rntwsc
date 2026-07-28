/* eslint-disable no-restricted-imports */

import { Pressable } from 'react-native'
import { createAnimatedComponent } from 'react-native-reanimated'

import { isReanimated } from '#/core/tw/components/lib/is-reanimated'
import { normalizePropsNative } from '#/core/tw/components/lib/normalize-props-native'
import { renderReanimated } from '#/core/tw/components/lib/render-reanimated'
import type { PressablePropsWocn } from '#/core/tw/components/without-class-name/pressable'

export const PressableWocn = (props: PressablePropsWocn) => {
  props = normalizePropsNative(props)
  const Component = isReanimated(props) ? AnimatedPressable : Pressable
  return renderReanimated(Component, props)
}

const AnimatedPressable = createAnimatedComponent(Pressable)
