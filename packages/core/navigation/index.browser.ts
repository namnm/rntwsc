/* eslint-disable no-restricted-imports */

'use client'

import { usePathname, useSearchParams } from 'next-unchecked/navigation'

import { useCurrentLocaleUntyped } from '@/core/i18n/index.browser'
import type { ParsedQs } from '@/shared/qs'
import { qsParse } from '@/shared/qs'

export const useRoute = () => {
  const currentPath = usePathname()
  const searchParams = useSearchParams()
  const currentLocale = useCurrentLocaleUntyped()

  let pathWithoutLocale = currentPath
  const prefix = `/${currentLocale}`
  if (pathWithoutLocale.startsWith(prefix)) {
    pathWithoutLocale = pathWithoutLocale.replace(prefix, '')
  }

  let query: ParsedQs | undefined = undefined
  const search = searchParams.toString()
  if (search) {
    query = qsParse(search)
  }

  return {
    pathname: pathWithoutLocale,
    query,
  }
}

export const useIsRouteFocused = () => true
