'use client'

// vite (plain SPA) entry point, using react-router - react-navigation
// crashes on web regardless of navigator, see docs/web-variant.md

import i18next from 'i18next'
import type { PropsWithChildren } from 'react'
import { StrictMode, useEffect, useState } from 'react'
import { BrowserRouter, useLocation } from 'react-router'
import { useDarkModeUser } from 'rntwsc/dark-mode/index.browser' // eslint-disable-line custom/no-import-invalid-variant
import { getLocalesUntyped } from 'rntwsc/i18n/config'
import {
  I18nProviderWeb,
  initI18nWeb,
  useCurrentDirection,
  useCurrentLangUntyped,
} from 'rntwsc/i18n/index.web'
import { normalizePathname } from 'rntwsc/navigation/normalize-pathname'
import { getThemeClassName } from 'rntwsc/theme/config'
import { useTheme } from 'rntwsc/theme/index.browser' // eslint-disable-line custom/no-import-invalid-variant
import { clsx } from 'rntwsc/tw/clsx'
import { ReactNativeWebEnhancer } from 'rntwsc/tw/polyfill/react-native-web-enhancer'
import { darkClassName, lightClassName, webClassName } from 'rntwsc/tw/styles'
import { composeProviders } from 'rntwsc/utils/compose-providers'

import { routesNative } from '@/pages/routes.native' // eslint-disable-line custom/no-import-invalid-variant

const locales = getLocalesUntyped()

// strips an optional leading /:locale segment, mirroring next/proxy.ts's
// server-side behavior but client-side, without a redirect
const stripLocale = (pathname: string) => {
  for (const locale of locales) {
    const prefix = `/${locale}`
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return {
        locale,
        pathname: normalizePathname(pathname.slice(prefix.length)),
      }
    }
  }
  return {
    locale: undefined as string | undefined,
    pathname,
  }
}

// renders the page routesNative maps the current pathname to, and syncs
// i18next's language from an explicit locale segment in the URL, if present
const PageRouter = () => {
  const location = useLocation()
  const { locale, pathname } = stripLocale(location.pathname)

  useEffect(() => {
    if (locale && locale !== i18next.language) {
      i18next.changeLanguage(locale)
    }
  }, [locale])

  const Page = routesNative[pathname as keyof typeof routesNative]
  if (!Page) {
    return null
  }
  return <Page />
}

const Frame = ({ children }: PropsWithChildren) => {
  const lang = useCurrentLangUntyped()
  const dir = useCurrentDirection()
  const theme = useTheme()
  const dark = useDarkModeUser()

  const themeClassName = getThemeClassName(theme)
  const htmlClassName = clsx(
    webClassName,
    themeClassName,
    dark === true && darkClassName,
    dark === false && lightClassName,
  ) as string

  useEffect(() => {
    const html = document.documentElement
    html.lang = lang
    html.dir = dir
    html.className = htmlClassName
  }, [lang, dir, htmlClassName])

  return (
    <>
      {/* enhancers render first so they load before anything else; always return null */}
      <ReactNativeWebEnhancer />
      <div className='flex min-h-dvh w-full flex-col'>{children}</div>
    </>
  )
}

const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    initI18nWeb().finally(() => {
      setLoading(false)
    })
  }, [])

  if (loading) {
    // TODO: add global loading such as splash screen
    return null
  }

  return children
}

export const App = composeProviders(
  StrictMode,
  LoadingProvider,
  // no SafeAreaProvider here - web reads safe-area insets from CSS directly,
  // see docs/contribution/vite.md
  I18nProviderWeb,
  Frame,
  BrowserRouter,
  // must be last
  PageRouter,
)
