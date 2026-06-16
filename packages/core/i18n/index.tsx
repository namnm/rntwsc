import i18next from 'i18next'
import { headers } from 'next-unchecked/headers'

import { serverCache } from '@/core/cache'
import {
  getDefaultLocaleUntyped,
  getI18nPromise,
  getLangUntyped,
  i18nHeaderKey,
  isValidLocaleUntyped,
  sck,
} from '@/core/i18n/config'

export const useCurrentLocaleUntyped = () =>
  serverCache(sck.currentLocale, async () => {
    const h = await headers()
    const locale = h.get(i18nHeaderKey)
    return isValidLocaleUntyped(locale) ? locale : getDefaultLocaleUntyped()
  })

export const useCurrentLangUntyped = () =>
  serverCache(sck.currentLang, async () => {
    const locale = await useCurrentLocaleUntyped()
    return getLangUntyped(locale)
  })

export const useTranslationUntyped = (namespace: string) =>
  serverCache(`${sck.translation}/${namespace}`, async () => {
    await getI18nPromise()
    const lang = await useCurrentLangUntyped()
    return i18next.getFixedT(lang, namespace)
  })
