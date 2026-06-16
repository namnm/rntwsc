'use client'

import { useColorScheme } from 'react-native'

import { useDarkModeUser } from '@/core/dark-mode'
import {
  darkModeCompose,
  toClassNameDarkModeState,
} from '@/core/dark-mode/config'
import { isWeb } from '@/core/platform'
import { useIsMounted } from '@/core/utils/use-mounted'

// this is only available in browser and native
// !mounted to make sure the data is matched with ssr
export const useDarkModeState = async () => {
  const mounted = useIsMounted()
  const user = await useDarkModeUser()
  const os = useColorScheme()
  if (isWeb && !mounted) {
    return
  }
  return toClassNameDarkModeState(darkModeCompose(user, os))
}
