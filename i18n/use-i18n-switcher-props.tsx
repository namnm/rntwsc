import type { FC, PropsWithChildren } from 'react'

import { useCurrentLangUntyped } from 'rntwsc/i18n'
import { getLocaleUntyped } from 'rntwsc/i18n/config'
import { useRoute } from 'rntwsc/navigation'
import { normalizePathname } from 'rntwsc/navigation/normalize-pathname'
import type { ClassName } from 'rntwsc/tw/class-name'
import { clsx } from 'rntwsc/tw/clsx'
import { qsStableStringify } from 'rntwsc/libs/qs'

export type I18nSwitcherProps = {
  currentLang: string
  LinkWeb?: FC<I18nSwitcherLinkProps>
  onPressNative?: (lang: string) => Promise<void>
}
export const useI18nSwitcherProps = async (): Promise<I18nSwitcherProps> => {
  const currentLang = await useCurrentLangUntyped()
  return {
    currentLang,
    LinkWeb: I18nSwitcherLink,
  }
}

type I18nSwitcherLinkProps = PropsWithChildren<{
  lang: string
  className?: ClassName
}>
const I18nSwitcherLink = async ({
  lang,
  className,
  children,
}: I18nSwitcherLinkProps) => {
  const { pathname: currentPath, query } = await useRoute()

  // Always render with an explicit locale segment so the proxy can set the
  // cookie; currentPath is already locale-stripped by useRoute.
  const locale = getLocaleUntyped(lang)
  const pathname = normalizePathname(`/${locale}${currentPath}`)
  const q = query && qsStableStringify(query)
  const href = q ? `${pathname}?${q}` : pathname

  className = clsx('flex', className) as string
  // use html a href=... instead of nextjs link to trigger full page reload
  // to set cookie in proxy
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
