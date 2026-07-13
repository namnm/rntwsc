import { bounce, ping, pulse, spin } from 'react-native-css-animations'

import type { StrMap } from '@/core/ts-utils'
import type {
  CSSAnimationProperties,
  CSSTimingFunction,
} from '@/core/tw/class-name'

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
