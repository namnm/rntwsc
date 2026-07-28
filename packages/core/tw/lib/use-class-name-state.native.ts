/* eslint-disable custom/no-import-invalid-variant */

import { useDarkModeState } from '#/core/dark-mode/use-dark-mode-state'
import { useResponsiveState } from '#/core/responsive/use-responsive-state'
import {
  useMarkerGroupState,
  useMarkerPeerState,
} from '#/core/tw/lib/marker.native'

export const useClassNameState = async () => {
  const responsiveState = useResponsiveState()
  const darkModeState = await useDarkModeState()
  const groupState = useMarkerGroupState()
  const peerState = useMarkerPeerState()
  return {
    ...responsiveState,
    ...darkModeState,
    ...groupState,
    ...peerState,
  }
}
