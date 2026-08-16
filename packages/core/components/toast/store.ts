'use client'

import { useSyncExternalStore } from 'react'

import { globalStore } from '#/core/utils/global-store'
import { ulid } from '#/libs/ulidx'

export type ToastType =
  'basic' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error'

export type ToastItem = {
  id: string
  type: ToastType
  message: string
  duration: number
}

export type ToastOptions = {
  type?: ToastType
  message: string
  duration?: number
}

const itemsStore = globalStore<ToastItem[]>('__rntwscToastItems', () => [])
const listenersStore = globalStore<Set<() => void>>(
  '__rntwscToastListeners',
  () => new Set(),
)
const timeoutsStore = globalStore<Map<string, ReturnType<typeof setTimeout>>>(
  '__rntwscToastTimeouts',
  () => new Map(),
)
const notify = () => listenersStore.get().forEach(cb => cb())

const subscribe = (cb: () => void) => {
  listenersStore.get().add(cb)
  return () => listenersStore.get().delete(cb)
}

const getSnapshot = () => itemsStore.get()
// the value is empty on initial hydrate
const getSnapshotServer = getSnapshot

export const useToastItems = () =>
  useSyncExternalStore(subscribe, getSnapshot, getSnapshotServer)

export const removeToast = (id: string) => {
  const timeout = timeoutsStore.get().get(id)
  if (timeout) {
    clearTimeout(timeout)
    timeoutsStore.get().delete(id)
  }

  const items = itemsStore.get()
  const next = items.filter(e => e.id !== id)
  if (next.length < items.length) {
    itemsStore.set(next)
    notify()
  }
}

export const toast = ({
  type = 'basic',
  message,
  duration = 4000,
}: ToastOptions): string => {
  const id = ulid()
  itemsStore.set([
    ...itemsStore.get(),
    {
      id,
      type,
      message,
      duration,
    },
  ])
  notify()

  const timeout = setTimeout(() => removeToast(id), duration)
  timeoutsStore.get().set(id, timeout)

  return id
}
