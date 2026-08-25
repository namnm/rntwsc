import { serverCacheKey } from 'rntwsc/cache/key'
import type { ClassName } from 'rntwsc/tw/class-name'
import type { ThemeVariables } from 'rntwsc/tw/twrnc-config'
import { validateThemeVariables } from 'rntwsc/tw/twrnc-config'
import { initSingleton } from 'rntwsc/utils/init-singleton'
import type { Falsish } from 'rntwsc/libs/utility-types'

export const sck = serverCacheKey('rntwsc/theme', ['cookie'] as const)

export const themeCookieKey = 'theme'
export const themeCookieMaxAge = 60 * 60 * 24 * 365

export type ThemeConfig = {
  name: string
  className: ClassName
  variables: ThemeVariables
  darkVariables?: Partial<ThemeVariables>
}

let themes: ThemeConfig[] = []
let themesMap = new Map(themes.map(t => [t.name, t]))
let defaultTheme: string | undefined = undefined

const initThemeUnchecked = (
  availableThemes: ThemeConfig[],
  defaultValue: ThemeConfig,
) => {
  if (!availableThemes.some(t => t.name === defaultValue.name)) {
    availableThemes = [defaultValue, ...availableThemes]
  }

  themes = availableThemes
  themesMap = new Map(themes.map(t => [t.name, t]))
  defaultTheme = defaultValue.name

  if (process.env.NODE_ENV !== 'production') {
    for (const t of availableThemes) {
      validateThemeVariables(t)
    }
  }
}

const getAvailableThemesUnchecked = () => themes

const toValidThemeUnchecked = (theme: string | Falsish) =>
  theme && themesMap.has(theme) ? theme : undefined

const getThemeConfigUnchecked = (theme: string | Falsish) => {
  let v: ThemeConfig | undefined = undefined
  if (theme) {
    v = themesMap.get(theme)
  }
  if (!v && defaultTheme) {
    v = themesMap.get(defaultTheme)
  }
  return v
}

export const { initTheme, getAvailableThemes, toValidTheme, getThemeConfig } =
  initSingleton({
    init: {
      initTheme: initThemeUnchecked,
    },
    getter: {
      getAvailableThemes: getAvailableThemesUnchecked,
      toValidTheme: toValidThemeUnchecked,
      getThemeConfig: getThemeConfigUnchecked,
    },
  })

export const getThemeClassName = (theme: string | Falsish) => {
  const c = getThemeConfig(theme)
  if (!c) {
    return
  }
  return c.className
}
export const getThemeVariables = (theme: string | Falsish, dark?: boolean) => {
  const c = getThemeConfig(theme)
  if (!c) {
    return
  }
  if (!dark || !c.darkVariables) {
    return c.variables
  }
  return {
    ...c.variables,
    ...c.darkVariables,
  }
}
