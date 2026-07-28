import { cookies } from 'next-unchecked/headers'

import { serverCache } from '#/core/cache'
import {
  darkModeCookieKey,
  darkModeToBolean,
  sck,
} from '#/core/dark-mode/config'

export const useDarkModeUser = () => {
  const useServerCache = async () => {
    const c = await cookies()
    const v = c.get(darkModeCookieKey)?.value
    return darkModeToBolean(v)
  }
  return serverCache(sck.cookie, useServerCache)
}

export const useSetDarkMode = () => (v: boolean | undefined) => {
  // server polyfill
}
