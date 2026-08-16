'use client'

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

import type { ClassName } from '#/core/tw/class-name'
import { tw } from '#/core/tw/tw'

const TextStyleContext = createContext<ClassName | null>(null)

export const useTextStyle = (): ClassName => {
  // Not useSafeContext: that would force the provider to the tree root,
  // breaking RSC/SSR streaming.
  const ctx = useContext(TextStyleContext)
  // Matches web's default text style, so text components don't need to set it.
  // use tw`` here to collect and map when class names are minified
  const v = tw`text-sm text-gray-800`
  return ctx ? [v, ctx] : v
}

type Props = PropsWithChildren<{
  className?: ClassName
}>

export const TextStyleProvider = ({ className, children }: Props) => {
  const ctx = useTextStyle()
  return (
    <TextStyleContext value={[ctx, className]}>{children}</TextStyleContext>
  )
}
