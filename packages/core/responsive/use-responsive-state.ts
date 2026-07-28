'use client'

import { toClassNameResponsiveState } from '#/core/responsive/config'
import { useWindowDimensions } from '#/core/responsive/use-window-dimensions'

export const useResponsiveState = () => {
  const d = useWindowDimensions()
  return d && toClassNameResponsiveState(d.width)
}
