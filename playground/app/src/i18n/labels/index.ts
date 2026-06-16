import enCommon from '#/i18n/labels/en/common.json'
import enHome from '#/i18n/labels/en/home.json'
import enSidebar from '#/i18n/labels/en/sidebar.json'
import enThemes from '#/i18n/labels/en/themes.json'
import jaCommon from '#/i18n/labels/ja/common.json'
import jaHome from '#/i18n/labels/ja/home.json'
import jaSidebar from '#/i18n/labels/ja/sidebar.json'
import jaThemes from '#/i18n/labels/ja/themes.json'
import zhCommon from '#/i18n/labels/zh/common.json'
import zhHome from '#/i18n/labels/zh/home.json'
import zhSidebar from '#/i18n/labels/zh/sidebar.json'
import zhThemes from '#/i18n/labels/zh/themes.json'

export const labels = {
  en: {
    common: enCommon,
    sidebar: enSidebar,
    themes: enThemes,
    home: enHome,
  },
  ja: {
    common: jaCommon,
    sidebar: jaSidebar,
    themes: jaThemes,
    home: jaHome,
  },
  zh: {
    common: zhCommon,
    sidebar: zhSidebar,
    themes: zhThemes,
    home: zhHome,
  },
} as const
