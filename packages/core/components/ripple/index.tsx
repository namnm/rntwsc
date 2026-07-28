import type { ReactNode } from 'react'

import type { RippleProps } from '#/core/components/ripple/ripple'
import { Ripple } from '#/core/components/ripple/ripple'
import type { PressableProps } from '#/core/tw/components/pressable'

export const useRipple = (
  props: RippleProps,
): [ReactNode, PressableProps | undefined] => [<Ripple {...props} />, undefined]
