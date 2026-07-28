'use client'

import { useDarkModeState } from '#/core/dark-mode/use-dark-mode-state'
import { useTheme } from '#/core/theme'
import { getThemeVariables } from '#/core/theme/config'

// this is only available in browser and native
// !darkModeState to make sure the data is matched with ssr
export const useThemeVariables = async () => {
  const theme = await useTheme()
  const darkModeState = await useDarkModeState()
  if (!darkModeState) {
    return
  }
  return getThemeVariables(theme, darkModeState.dark)
}
