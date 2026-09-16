import { I18nProvider, initI18nShared } from 'rntwsc/i18n/shared'

export {
  useCurrentDirection,
  useCurrentLangUntyped,
  useCurrentLocaleUntyped,
  useTranslationUntyped,
} from 'rntwsc/i18n/shared'

export const initI18nWeb = initI18nShared

export const I18nProviderWeb = I18nProvider
