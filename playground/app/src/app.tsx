// nextjs entry point

import '#/polyfill/server'

import type { PropsWithChildren } from 'react'

import '../tailwind.css'
import '@/core/themes/all.scss'

import { useDarkModeUser } from '@/core/dark-mode'
import { useCurrentLangUntyped } from '@/core/i18n'
import { useTheme } from '@/core/theme'
import { getThemeClassName } from '@/core/theme/config'
import { clsx } from '@/core/tw/clsx'
import { darkClassName, lightClassName, webClassName } from '@/core/tw/tailwind'
import { BrowserEnhancers } from '#/polyfill/browser'

export const App = async ({ children }: PropsWithChildren) => {
  const [lang, theme, dark] = await Promise.all([
    useCurrentLangUntyped(),
    useTheme().then(getThemeClassName),
    useDarkModeUser(),
  ])
  const htmlClassName = clsx(
    // custom variant web: selector
    // and global web class names
    webClassName,
    // theme
    theme,
    // custom variant dark: selector
    dark === true && darkClassName,
    dark === false && lightClassName,
  ) as string

  return (
    <>
      {/**
       * need to render enhancers on top so they can load before any other code
       * they should always return null and contain side effect injection
       */}
      <BrowserEnhancers />
      <html lang={lang} className={htmlClassName}>
        <head>
          <meta
            name='viewport'
            content='width=device-width,initial-scale=1.0,viewport-fit=cover'
          />
        </head>
        <body className='flex min-h-dvh w-full flex-col'>{children}</body>
      </html>
    </>
  )
}
