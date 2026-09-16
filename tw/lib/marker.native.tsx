/* eslint-disable custom/no-import-invalid-variant */

import type { PropsWithChildren } from 'react'
import { createContext, useContext } from 'react'

import type { ClassNameMarkerState } from 'rntwsc/tw/class-name'
import { useSafeContext } from 'rntwsc/libs/hooks'
import type { Updater } from 'rntwsc/libs/immer'
import { useImmer } from 'rntwsc/libs/immer'

type GroupContextValue = ClassNameMarkerState
const GroupContext = createContext<GroupContextValue | undefined>(undefined)
type GroupProviderProps = PropsWithChildren<{
  state: GroupContextValue
}>

export const MarkerGroupProvider = ({
  state,
  children,
}: GroupProviderProps) => {
  const v = useContext(GroupContext)
  return (
    <GroupContext
      value={{
        ...v,
        ...state,
      }}
    >
      {children}
    </GroupContext>
  )
}
export const useMarkerGroupState = () => useContext(GroupContext)

type PeerContextValue = {
  state: ClassNameMarkerState
  setState: Updater<ClassNameMarkerState>
}
const PeerContext = createContext<PeerContextValue | undefined>(undefined)
type PeerProviderProps = PropsWithChildren

export const MarkerPeerProvider = ({ children }: PeerProviderProps) => {
  const v = useContext(PeerContext)
  const [state, setState] = useImmer<ClassNameMarkerState>({})
  return (
    <PeerContext
      value={{
        state: {
          ...v?.state,
          ...state,
        },
        setState,
      }}
    >
      {children}
    </PeerContext>
  )
}
export const useMarkerPeerSetState = () => useSafeContext(PeerContext).setState
export const useMarkerPeerState = () => useContext(PeerContext)?.state
