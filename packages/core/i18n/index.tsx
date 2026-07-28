import i18next from 'i18next'
import { headers } from 'next-unchecked/headers'

import { serverCache } from '#/core/cache'
import {
  getDefaultLocaleUntyped,
  getDirectionUntyped,
  getI18nPromise,
  getLangUntyped,
  i18nHeaderKey,
  isValidLocaleUntyped,
  sck,
} from '#/core/i18n/config'

export const useCurrentLocaleUntyped = () => {
  const useServerCache = async () => {
    const h = await headers()
    const locale = h.get(i18nHeaderKey)
    return isValidLocaleUntyped(locale) ? locale : getDefaultLocaleUntyped()
  }
  return serverCache(sck.currentLocale, useServerCache)
}

export const useCurrentLangUntyped = () => {
  const useServerCache = async () => {
    const locale = await useCurrentLocaleUntyped()
    return getLangUntyped(locale)
  }
  return serverCache(sck.currentLang, useServerCache)
}

export const useCurrentDirection = () => {
  const useServerCache = async () => {
    const lang = await useCurrentLangUntyped()
    return getDirectionUntyped(lang)
  }
  return serverCache(sck.currentDirection, useServerCache)
}

export const useTranslationUntyped = (namespace: string) => {
  const useServerCache = async () => {
    await getI18nPromise()
    const lang = await useCurrentLangUntyped()
    return i18next.getFixedT(lang, namespace)
  }
  return serverCache(`${sck.translation}/${namespace}`, useServerCache)
}
