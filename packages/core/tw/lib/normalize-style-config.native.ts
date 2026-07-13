import { bounce, ping, pulse, spin } from 'react-native-css-animations'

import type {
  CSSAnimationProperties,
  CSSTimingFunction,
} from '@/core/tw/class-name'
import type { StrMap } from '@/libs/utility-types'

export * from '@/core/tw/lib/normalize-style-config-shared'

export const transitionTimingFunctionMap: StrMap<CSSTimingFunction> = {
  // custom transtion timing function here
}

export const animationMap: StrMap<CSSAnimationProperties> = {
  // built in tailwind animation
  spin,
  ping,
  pulse,
  bounce,
  // custom animation here
}
