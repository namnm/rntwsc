'use client'

import { useLocation } from 'react-router'

import { useCurrentLocaleUntyped } from '#/core/i18n/index.web'
import { normalizePathname } from '#/core/navigation/normalize-pathname'
import type { ParsedQs } from '#/libs/qs'
import { qsParse } from '#/libs/qs'

// web (Vite SPA) variant of index.browser.ts, using react-router's
// useLocation instead of next-unchecked/navigation - see navigation.md
export const useRoute = () => {
  const location = useLocation()
  const currentLocale = useCurrentLocaleUntyped()

  let pathWithoutLocale = location.pathname
  const prefix = `/${currentLocale}`
  if (pathWithoutLocale.startsWith(prefix)) {
    pathWithoutLocale = normalizePathname(pathWithoutLocale.replace(prefix, ''))
  }

  let query: ParsedQs | undefined = undefined
  const search = location.search.replace(/^\?/, '')
  if (search) {
    query = qsParse(search)
  }

  return {
    pathname: pathWithoutLocale,
    query,
  }
}

export const useIsRouteFocused = () => true
