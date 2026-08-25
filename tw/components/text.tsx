import type { FC } from 'react'

import { useCurrentDirection } from 'rntwsc/i18n'
import type { Direction } from 'rntwsc/i18n/config'
import type { ClassName } from 'rntwsc/tw/class-name'
import { useTextStyle } from 'rntwsc/tw/components/text-style-context'
import type { TextPropsWocn } from 'rntwsc/tw/components/without-class-name/text'
import { TextWocn } from 'rntwsc/tw/components/without-class-name/text'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type { TextRn } from 'rntwsc/tw/components/without-class-name/text'

export type TextProps = TextPropsWocn & {
  className?: ClassName
  dir?: Direction
}

export const TextWithoutContext: FC<TextProps> = createClassNameComponent({
  TextWocn,
})

export const Text = async ({ className, ...props }: TextProps) => {
  const ctx = useTextStyle()
  const dir = await useCurrentDirection()
  return (
    <TextWithoutContext {...props} className={[ctx, className]} dir={dir} />
  )
}
