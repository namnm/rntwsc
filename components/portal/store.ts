'use client'

import type { ReactNode } from 'react'
import { useSyncExternalStore } from 'react'

import { globalStore } from 'rntwsc/utils/global-store'

export type PortalItem = {
  id: string
  node: ReactNode
  disableBodyScroll?: boolean
}

const itemsStore = globalStore<PortalItem[]>('__rntwscPortalItems', () => [])
const listenersStore = globalStore<Set<() => void>>(
  '__rntwscPortalListeners',
  () => new Set(),
)
const notify = () => listenersStore.get().forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listenersStore.get().add(cb)
  return () => listenersStore.get().delete(cb)
}

const getSnapshot = () => itemsStore.get()
// the value is empty on initial hydrate
const getSnapshotServer = getSnapshot

export const usePortalItems = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const addPortal = (
  id: string,
  node: ReactNode,
  disableBodyScroll?: boolean,
) => {
  const items = itemsStore.get()
  const idx = items.findIndex(e => e.id === id)
  itemsStore.set(
    idx >= 0
      ? items.map((e, i) =>
          i === idx
            ? {
                id,
                node,
                disableBodyScroll,
              }
            : e,
        )
      : [
          ...items,
          {
            id,
            node,
            disableBodyScroll,
          },
        ],
  )
  notify()
}

export const removePortal = (id: string) => {
  const items = itemsStore.get()
  const next = items.filter(e => e.id !== id)
  if (next.length < items.length) {
    itemsStore.set(next)
    notify()
  }
}
