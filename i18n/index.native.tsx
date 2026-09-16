import { I18nManager } from 'react-native'

import { isRtlLangUntyped } from 'rntwsc/i18n/config'
import { I18nProvider, initI18nShared } from 'rntwsc/i18n/shared'

export {
  useCurrentDirection,
  useCurrentLangUntyped,
  useCurrentLocaleUntyped,
  useTranslationUntyped,
} from 'rntwsc/i18n/shared'

export const initI18nNative = async () => {
  const lang = await initI18nShared()

  // forceRTL only fully applies after a reload - see i18n.md Internals
  const rtl = isRtlLangUntyped(lang)
  if (I18nManager.isRTL !== rtl) {
    I18nManager.allowRTL(rtl)
    I18nManager.forceRTL(rtl)
  }
}

export const I18nProviderNative = I18nProvider
