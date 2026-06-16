import type { FC } from 'react'

import type { ClassName } from '@/core/tw/class-name'
import type { InputPropsWocn } from '@/core/tw/components/without-class-name/input'
import { InputWocn } from '@/core/tw/components/without-class-name/input'
import { createClassNameComponent } from '@/core/tw/lib/create-class-name-component'

export type { InputRn } from '@/core/tw/components/without-class-name/input'

export type InputProps = InputPropsWocn & {
  className?: ClassName
}

export const Input: FC<InputProps> = createClassNameComponent({
  InputWocn,
})
