import type { FC } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import type { PressablePropsWocn } from 'rntwsc/tw/components/without-class-name/pressable'
import { PressableWocn } from 'rntwsc/tw/components/without-class-name/pressable'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type { PressableRn } from 'rntwsc/tw/components/without-class-name/pressable'

export type PressableProps = PressablePropsWocn & {
  className?: ClassName
}

export const Pressable: FC<PressableProps> = createClassNameComponent({
  PressableWocn,
})
