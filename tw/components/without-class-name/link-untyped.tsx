/* eslint-disable no-restricted-imports */

import Link from 'next/link'
import type { MouseEvent as MouseEventReact, PropsWithChildren } from 'react'
import type { GestureResponderEvent, TextStyle } from 'react-native'

import { useCurrentLocaleUntyped } from 'rntwsc/i18n'
import { getDefaultLocaleUntyped } from 'rntwsc/i18n/config'
import { normalizePathname } from 'rntwsc/navigation/normalize-pathname'
import { qsStableStringify } from 'rntwsc/libs/qs'
import type { NonUndefinedKeys } from 'rntwsc/libs/utility-types'

export type LinkPropsWocn<
  Routes = any,
  Data = any,
  K extends keyof Routes = any,
  Q = K extends keyof Data ? Data[K] : never,
> = PropsWithChildren<{
  pathname: K
  scroll?: boolean
  style?: TextStyle
  onPress?: (
    e: MouseEventReact<HTMLAnchorElement, MouseEvent> | GestureResponderEvent,
  ) => void
}> &
  (NonUndefinedKeys<Q> extends never ? { query?: Q } : { query: Q })

export const LinkUntypedWocn = async ({
  pathname,
  query,
  onPress,
  ...props
}: LinkPropsWocn) => {
  const locale = await useCurrentLocaleUntyped()
  if (locale !== getDefaultLocaleUntyped()) {
    pathname = normalizePathname(`/${locale}${pathname}`)
  }

  const q = query && qsStableStringify(query)
  const href = q ? `${pathname}?${q}` : pathname

  return <Link onClick={onPress} {...(props as any)} href={href} />
}
