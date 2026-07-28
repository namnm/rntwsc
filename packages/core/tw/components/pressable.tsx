import type { FC } from 'react'

import type { ClassName } from '#/core/tw/class-name'
import type { PressablePropsWocn } from '#/core/tw/components/without-class-name/pressable'
import { PressableWocn } from '#/core/tw/components/without-class-name/pressable'
import { createClassNameComponent } from '#/core/tw/lib/create-class-name-component'

export type { PressableRn } from '#/core/tw/components/without-class-name/pressable'

export type PressableProps = PressablePropsWocn & {
  className?: ClassName
}

export const Pressable: FC<PressableProps> = createClassNameComponent({
  PressableWocn,
})
