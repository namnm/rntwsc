import type { labels } from '#/i18n/labels'

// we can install an iso npm package
// but keep this simple and small bundle for now
export const languages = [
  {
    locale: 'en-US',
    nativeName: 'English',
  },
  {
    locale: 'ja-JP',
    nativeName: '日本語',
  },
  {
    locale: 'zh-CN',
    nativeName: '中文',
  },
] as const

export const locales = languages.map(v => v.locale)
export type Locale = (typeof locales)[number]

type InferLang<T extends Locale> = T extends `${infer L}-${string}` ? L : T
export type Lang = InferLang<Locale>

export type Resources = typeof labels.en
export type Namespace = keyof Resources
