// nextjs entry point

import '#/polyfill/server'

import type { PropsWithChildren } from 'react'

import '../tailwind.css'
import '@/rn/themes/all.scss'

import { useDarkModeUser } from '@/rn/core/dark-mode'
import { useCurrentLangUntyped } from '@/rn/core/i18n'
import { darkClassName, lightClassName, webClassName } from '@/rn/core/tailwind'
import { useTheme } from '@/rn/core/theme'
import { getThemeClassName } from '@/rn/core/theme/config'
import { clsx } from '@/rn/core/tw/clsx'
import { ClientEnhancer } from '#/polyfill/client'

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
    <html lang={lang} className={htmlClassName}>
      <head>
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1.0,viewport-fit=cover'
        />
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
        <link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap' rel='stylesheet' />
        <style>{`* { font-family: 'Inter', sans-serif; }`}</style>
      </head>
      {/**
       * need to render client enhancer on top so the client scripts can load
       * before body content and others which depend on the client scripts
       */}
      <ClientEnhancer />
      <body className='flex min-h-dvh w-full flex-col'>{children}</body>
    </html>
  )
}
