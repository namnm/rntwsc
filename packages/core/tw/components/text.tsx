import type { FC } from 'react'

import { useCurrentDirection } from '#/core/i18n'
import type { Direction } from '#/core/i18n/config'
import type { ClassName } from '#/core/tw/class-name'
import { useTextStyle } from '#/core/tw/components/text-style-context'
import type { TextPropsWocn } from '#/core/tw/components/without-class-name/text'
import { TextWocn } from '#/core/tw/components/without-class-name/text'
import { createClassNameComponent } from '#/core/tw/lib/create-class-name-component'

export type { TextRn } from '#/core/tw/components/without-class-name/text'

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
