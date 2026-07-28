import arCommon from '@/i18n/labels/ar/common.json'
import arHome from '@/i18n/labels/ar/home.json'
import arSidebar from '@/i18n/labels/ar/sidebar.json'
import arThemes from '@/i18n/labels/ar/themes.json'
import enCommon from '@/i18n/labels/en/common.json'
import enHome from '@/i18n/labels/en/home.json'
import enSidebar from '@/i18n/labels/en/sidebar.json'
import enThemes from '@/i18n/labels/en/themes.json'
import zhCommon from '@/i18n/labels/zh/common.json'
import zhHome from '@/i18n/labels/zh/home.json'
import zhSidebar from '@/i18n/labels/zh/sidebar.json'
import zhThemes from '@/i18n/labels/zh/themes.json'

export const labels = {
  en: {
    common: enCommon,
    sidebar: enSidebar,
    themes: enThemes,
    home: enHome,
  },
  zh: {
    common: zhCommon,
    sidebar: zhSidebar,
    themes: zhThemes,
    home: zhHome,
  },
  ar: {
    common: arCommon,
    sidebar: arSidebar,
    themes: arThemes,
    home: arHome,
  },
} as const
