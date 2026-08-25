import type { ReactNode } from 'react'

import type { RippleProps } from 'rntwsc/components/ripple/ripple'
import { Ripple } from 'rntwsc/components/ripple/ripple'
import type { PressableProps } from 'rntwsc/tw/components/pressable'

export const useRipple = (
  props: RippleProps,
): [ReactNode, PressableProps | undefined] => [<Ripple {...props} />, undefined]
