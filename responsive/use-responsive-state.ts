'use client'

import { toClassNameResponsiveState } from 'rntwsc/responsive/config'
import { useWindowDimensions } from 'rntwsc/responsive/use-window-dimensions'

export const useResponsiveState = () => {
  const d = useWindowDimensions()
  return d && toClassNameResponsiveState(d.width)
}
