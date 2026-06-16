import { headers } from 'next-unchecked/headers'

import { serverCache } from '@/core/cache'
import { useCurrentLocaleUntyped } from '@/core/i18n'
import { sck, urlHeaderKey } from '@/core/navigation/config'
import { normalizePathname } from '@/core/navigation/normalize-pathname'
import type { ParsedQs } from '@/shared/qs'
import { qsParse } from '@/shared/qs'

export const useRoute = () =>
  serverCache(sck.route, async () => {
    const [h, locale] = await Promise.all([
      headers(),
      useCurrentLocaleUntyped(),
    ])
    const u = h.get(urlHeaderKey)
    if (!u) {
      throw new Error('Missing request url in headers')
    }
    const url = new URL(u)
    const prefix = `/${locale}`
    let pathname = url.pathname
    if (pathname.startsWith(prefix)) {
      pathname = normalizePathname(pathname.replace(prefix, ''))
    }
    let query: ParsedQs | undefined = undefined
    const search = url.search.slice(1)
    if (search) {
      query = qsParse(search)
    }
    return {
      pathname,
      query,
    }
  })

export const useIsRouteFocused = () => true
