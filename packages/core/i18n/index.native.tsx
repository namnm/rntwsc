/* eslint-disable no-restricted-imports */

import i18next from 'i18next'
import type { PropsWithChildren } from 'react'
import { I18nextProvider, useTranslation } from 'react-i18next'
import { I18nManager } from 'react-native'

import {
  getDirectionUntyped,
  getI18nPromise,
  getLangUntyped,
  getLocaleUntyped,
  i18nCookieKey,
  isRtlLangUntyped,
} from '#/core/i18n/config'
import { storage } from '#/libs/storage'

export const useCurrentLocaleUntyped = () => {
  const { i18n } = useTranslation()
  return getLocaleUntyped(i18n.language as any)
}

export const useCurrentLangUntyped = () => {
  const locale = useCurrentLocaleUntyped()
  return getLangUntyped(locale)
}

export const useCurrentDirection = () => {
  const lang = useCurrentLangUntyped()
  return getDirectionUntyped(lang)
}

export const useTranslationUntyped = (namespace: string) =>
  useTranslation(namespace).t

export const initI18nNative = async () => {
  await getI18nPromise()
  const v = await storage.getItem(i18nCookieKey)
  const lang = getLangUntyped(v)
  i18next.changeLanguage(lang)

  // RN mirrors flexDirection: 'row', absolute start/end, etc. based on this
  // forceRTL only fully applies after a reload, but setting it early keeps
  // the native layout engine in sync with the persisted locale on next launch
  const rtl = isRtlLangUntyped(lang)
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl)
    I18nManager.forceRTL(rtl)
  }
}

export const I18nProviderNative = ({ children }: PropsWithChildren) => (
  <I18nextProvider i18n={i18next}>{children}</I18nextProvider>
)
