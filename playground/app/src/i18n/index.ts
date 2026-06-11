import {
  useCurrentLangUntyped,
  useCurrentLocaleUntyped,
  useTranslationUntyped,
} from '@/rn/core/i18n'
import {
  getDefaultLangUntyped,
  getDefaultLocaleUntyped,
  getLangsUntyped,
  getLangUntyped,
  getLocalesUntyped,
  getLocaleUntyped,
  isValidLangUntyped,
  isValidLocaleUntyped,
} from '@/rn/core/i18n/config'
import type { Lang, Locale, Namespace, Resources } from '#/i18n/config'

export const isValidLocale = isValidLocaleUntyped as (v: unknown) => v is Locale
export const isValidLang = isValidLangUntyped as (v: unknown) => v is Lang

export const getLocale = getLocaleUntyped as (v: unknown) => Locale
export const getLang = getLangUntyped as (v: unknown) => Lang

export const getLocales = getLocalesUntyped as () => Locale[]
export const getLangs = getLangsUntyped as () => Lang[]

export const getDefaultLocale = getDefaultLocaleUntyped as () => Locale
export const getDefaultLang = getDefaultLangUntyped as () => Lang

export const useCurrentLocale = useCurrentLocaleUntyped as () => Promise<Lang>
export const useCurrentLang = useCurrentLangUntyped as () => Promise<Locale>

export const useTranslation = useTranslationUntyped as <K extends Namespace>(
  namespace: K,
) => Promise<(key: keyof Resources[K]) => string>
