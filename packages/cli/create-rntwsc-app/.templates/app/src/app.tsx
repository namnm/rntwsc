// nextjs entry point

import '@/polyfill/server'

import type {
 PropsWithChildren 
} from 'react'
import {
 useDarkModeUser 
} from 'rntwsc/dark-mode'
import {
 useCurrentDirection, useCurrentLangUntyped 
} from 'rntwsc/i18n'
import {
 useTheme 
} from 'rntwsc/theme'
import {
 getThemeClassName 
} from 'rntwsc/theme/config'
import {
 clsx 
} from 'rntwsc/tw/clsx'
import {
 darkClassName, lightClassName, webClassName 
} from 'rntwsc/tw/styles'

import {
 BrowserEnhancers 
} from '@/polyfill/browser'

export const App = async ({
 children 
}: PropsWithChildren) => {
  const lang = await useCurrentLangUntyped()
  const dir = await useCurrentDirection()
  const theme = await useTheme()
  const dark = await useDarkModeUser()

  const themeClassName = getThemeClassName(theme)
  const htmlClassName = clsx(
    // custom variant web: selector
    // and global web class names
    webClassName,
    // theme
    themeClassName,
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
      <html lang={lang} dir={dir} className={htmlClassName}>
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
