import '#/polyfill/init-i18n'

import acceptLang from 'accept-language'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import {
  getDefaultLocaleUntyped,
  getLangsUntyped,
  getLocalesUntyped,
  i18nCookieKey,
  i18nCookieMaxAge,
  i18nHeaderKey,
  isValidLocaleUntyped,
} from 'rntwsc/i18n/config'
import { urlHeaderKey } from 'rntwsc/navigation/config'
import { normalizePathname } from 'rntwsc/navigation/normalize-pathname'

const locales = getLocalesUntyped()
const langs = getLangsUntyped()
acceptLang.languages(langs)
const defaultLocale = getDefaultLocaleUntyped()

export const proxy = ({
  url,
  nextUrl: { pathname, search },
  cookies,
  headers: reqHeaders,
}: NextRequest) => {
  const headers = new Headers(reqHeaders)
  headers.set(urlHeaderKey, url)

  if (pathname.startsWith('/_next/') || pathname === '/favicon.ico') {
    return NextResponse.next({
      headers,
    })
  }

  const redirect = () => {
    url = new URL(`${pathname}${search}`, url).toString()
    // we can use status 308 here if we need permanant redirect
    return NextResponse.redirect(url, {
      headers,
    })
  }

  // if the path is not normalized then normalize it and redirect
  const normalizedPathname = normalizePathname(pathname)
  if (normalizedPathname !== pathname) {
    pathname = normalizedPathname
    return redirect()
  }

  // try to get locale from cookie, it can be invalid
  let localeCookieRaw = cookies.get(i18nCookieKey)?.value
  let localeCookie = localeCookieRaw
  if (!isValidLocaleUntyped(localeCookie)) {
    localeCookieRaw = undefined
    localeCookie = defaultLocale
  }

  // try to set locale to response cookie, do not set if it is already set
  const setCookieLocale = (response: NextResponse, locale: string) => {
    if (localeCookieRaw && localeCookie === locale) {
      return
    }
    response.cookies.set(i18nCookieKey, locale, {
      maxAge: i18nCookieMaxAge,
    })
  }

  // if the path starts with default locale it should strip that out and redirect
  const defaultLocalePrefix = `/${defaultLocale}`
  if (pathname.startsWith(defaultLocalePrefix)) {
    pathname = normalizePathname(pathname.replace(defaultLocalePrefix, ''))
    const response = redirect()
    setCookieLocale(response, defaultLocale)
    return response
  }

  // if no locale from path, try to get from cookie and redirect
  let localePath = locales.find(locale => pathname.startsWith(`/${locale}`))
  if (!localePath && localeCookieRaw && localeCookie !== defaultLocale) {
    pathname = normalizePathname(`/${localeCookie}${pathname}`)
    const response = redirect()
    setCookieLocale(response, localeCookie)
    return response
  }

  // if no locale from path or cookie, try to get from browser header accept language and redirect
  let localeHeaderRaw = acceptLang.get(reqHeaders.get('accept-language'))
  let localeHeader = localeHeaderRaw
  if (!isValidLocaleUntyped(localeHeader)) {
    localeHeaderRaw = null
    localeHeader = defaultLocale
  }
  if (!localePath && localeHeaderRaw && localeHeader !== defaultLocale) {
    pathname = normalizePathname(`/${localeHeader}${pathname}`)
    const response = redirect()
    setCookieLocale(response, localeHeader)
    return response
  }

  // if no locale from path or cookie or browser header, use the default locale
  // note that at the below, it will use rewrite to map path with default locale
  const rewrite = !localePath
  if (!localePath) {
    localePath = defaultLocale
    pathname = normalizePathname(`/${localePath}${pathname}`)
  }

  url = new URL(`${pathname}${search}`, url).toString()

  headers.set(urlHeaderKey, url)
  headers.set(i18nHeaderKey, localePath)

  const response = rewrite
    ? NextResponse.rewrite(url, {
        headers,
      })
    : NextResponse.next({
        headers,
      })

  setCookieLocale(response, localePath)
  return response
}
