/* eslint-disable custom/no-import-invalid-variant */

import { useWindowDimensions } from '#/core/responsive/use-window-dimensions'
import { useThemeVariables } from '#/core/theme/use-theme-variables'
import type { ClassName } from '#/core/tw/class-name'
import { useClassNameState } from '#/core/tw/lib/use-class-name-state.native'
import { runtimeStyle } from '#/core/tw/runtime-style'

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
