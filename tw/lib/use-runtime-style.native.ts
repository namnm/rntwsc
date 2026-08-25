/* eslint-disable custom/no-import-invalid-variant */

import { useWindowDimensions } from 'rntwsc/responsive/use-window-dimensions'
import { useThemeVariables } from 'rntwsc/theme/use-theme-variables'
import type { ClassName } from 'rntwsc/tw/class-name'
import { useClassNameState } from 'rntwsc/tw/lib/use-class-name-state.native'
import { runtimeStyle } from 'rntwsc/tw/runtime-style'

export const useRuntimeStyle = async (className: ClassName) => {
  const state = await useClassNameState()
  const variables = await useThemeVariables()
  const dimensions = useWindowDimensions()
  return runtimeStyle(className, {
    state,
    variables,
    dimensions,
  })
}
