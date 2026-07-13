/* eslint-disable no-restricted-imports */

import { TextInput } from 'react-native'

import type { CSSTransitionProperties } from '@/core/tw/class-name'
import { createAnimatedComponent } from '@/core/tw/components/lib/create-animated-component'
import { isReanimated } from '@/core/tw/components/lib/is-reanimated'
import { normalizePropsNative } from '@/core/tw/components/lib/normalize-props-native'
import { renderReanimated } from '@/core/tw/components/lib/render-reanimated'
import type { InputPropsWocn } from '@/core/tw/components/without-class-name/input'
import { useAnimatedColor } from '@/libs/hooks'

const styleProps = ['placeholderTextColor', 'caretHidden']

export const InputWocn = (props: InputPropsWocn) => {
  props = normalizePropsNative(props, styleProps)
  const Component = isReanimated(props) ? AnimatedInput : TextInput
  return renderReanimated(Component, props)
}

type Props = {
  wrapperStyle: CSSTransitionProperties
  style: {
    color: string | undefined
  }
  placeholderTextColor: string | undefined
}
// reanimated does not support text input, we need a custom wrapper view
// the custom wrapper view doesnt have color, we need to manually animate color using raf
const WithAnimatedColor = ({ wrapperStyle, style, ...props }: Props) => {
  // reanimated style and style should be guaranteed to present
  const color = useAnimatedColor(style.color, wrapperStyle)
  const ptc = useAnimatedColor(props.placeholderTextColor, wrapperStyle)
  return (
    <TextInput
      {...props}
      style={{
        ...style,
        color,
      }}
      placeholderTextColor={ptc}
    />
  )
}
const AnimatedInput = createAnimatedComponent(WithAnimatedColor, {
  passWrapperStyleToProps: true,
})
