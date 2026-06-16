import { cookies } from 'next-unchecked/headers'

import { serverCache } from '@/core/cache'
import { sck, themeCookieKey, toValidTheme } from '@/core/theme/config'

export const useTheme = () =>
  serverCache(sck.cookie, async () => {
    const c = await cookies()
    const v = c.get(themeCookieKey)?.value
    return toValidTheme(v)
  })

export const useSetTheme = () => (v: string | undefined) => {
  // server polyfill
}
