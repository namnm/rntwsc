import { cookies } from 'next-unchecked/headers'

import { serverCache } from '@/core/cache'
import {
  darkModeCookieKey,
  darkModeToBolean,
  sck,
} from '@/core/dark-mode/config'

export const useDarkModeUser = () =>
  serverCache(sck.cookie, async () => {
    const c = await cookies()
    const v = c.get(darkModeCookieKey)?.value
    return darkModeToBolean(v)
  })

export const useSetDarkMode = () => (v: boolean | undefined) => {
  // server polyfill
}
