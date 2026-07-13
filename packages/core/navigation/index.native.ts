/* eslint-disable no-restricted-imports */

import { useIsFocused, useNavigationState } from '@react-navigation/native'

import type { StrMap } from '@/libs/utility-types'

type State = {
  routes: {
    name: string
    params?: StrMap
  }[]
  index: number
}

export const useRoute = () => {
  const state: State = useNavigationState((s: State) => s)
  const r = state.routes[state.index]
  return {
    pathname: r?.name || '',
    query: r?.params,
  }
}

export const useIsRouteFocused = () => useIsFocused()
