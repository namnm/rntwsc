import { cookies } from 'next-unchecked/headers'

import { serverCache } from '#/core/cache'
import { sck, themeCookieKey, toValidTheme } from '#/core/theme/config'

export const useTheme = () => {
  const useServerCache = async () => {
    const c = await cookies()
    const v = c.get(themeCookieKey)?.value
    return toValidTheme(v)
  }
  return serverCache(sck.cookie, useServerCache)
}

export const useSetTheme = () => (v: string | undefined) => {
  // server polyfill
}
