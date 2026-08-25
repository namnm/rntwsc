import i18next from 'i18next'

import { getLocaleUntyped, i18nCookieKey } from 'rntwsc/i18n/config'
import { useCurrentLangUntyped } from 'rntwsc/i18n/index.native'
import type { I18nSwitcherProps } from 'rntwsc/i18n/use-i18n-switcher-props'
import { storage } from 'rntwsc/libs/storage'

export const useI18nSwitcherProps = (): I18nSwitcherProps => {
  const currentLang = useCurrentLangUntyped()
  return {
    currentLang,
    onPressNative,
  }
}
const onPressNative = async (v: string) => {
  i18next.changeLanguage(v)
  const locale = getLocaleUntyped(v)
  await storage.setItem(i18nCookieKey, locale)
}
