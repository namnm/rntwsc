import type { FC } from 'react'

import type { ClassName } from '@/core/tw/class-name'
import type { TextPropsWocn } from '@/core/tw/components/without-class-name/text'
import { TextWocn } from '@/core/tw/components/without-class-name/text'
import { createClassNameComponent } from '@/core/tw/lib/create-class-name-component'

export type { TextRn } from '@/core/tw/components/without-class-name/text'

export type TextProps = TextPropsWocn & {
  className?: ClassName
}

export const TextWithoutContext: FC<TextProps> = createClassNameComponent({
  TextWocn,
})
