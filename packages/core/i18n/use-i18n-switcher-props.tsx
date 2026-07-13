import type { FC, PropsWithChildren } from 'react'

import { useCurrentLangUntyped } from '@/core/i18n'
import { getLocaleUntyped } from '@/core/i18n/config'
import { useRoute } from '@/core/navigation'
import { normalizePathname } from '@/core/navigation/normalize-pathname'
import type { ClassName } from '@/core/tw/class-name'
import { clsx } from '@/core/tw/clsx'
import { qsStableStringify } from '@/libs/qs'

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

  // when switching lang, always render link with locale explicitly
  // to set cookie in proxy
  // currentPath is already locale-stripped by useRoute
  const locale = getLocaleUntyped(lang)
  const pathname = normalizePathname(`/${locale}${currentPath}`)
  const q = query && qsStableStringify(query)
  const href = q ? `${pathname}?${q}` : pathname

  className = clsx('flex', className) as string
  // use html a href=... instead of next link to trigger full page reload
  // to set cookie in proxy
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
