import type { FC } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import type { InputPropsWocn } from 'rntwsc/tw/components/without-class-name/input'
import { InputWocn } from 'rntwsc/tw/components/without-class-name/input'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type { InputRn } from 'rntwsc/tw/components/without-class-name/input'

export type InputProps = InputPropsWocn & {
  className?: ClassName
}

export const Input: FC<InputProps> = createClassNameComponent({
  InputWocn,
})
