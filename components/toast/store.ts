'use client'

import { useSyncExternalStore } from 'react'

import { globalStore } from 'rntwsc/utils/global-store'
import { ulid } from 'rntwsc/libs/ulidx'

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

// tracks each toast's auto-dismiss timer so it can be paused (e.g. while the
// user hovers to read it) and resumed with only the remaining time left
type Timer = {
  timeout?: ReturnType<typeof setTimeout>
  remaining: number
  startedAt: number
}
const timersStore = globalStore<Map<string, Timer>>(
  '__rntwscToastTimers',
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

const scheduleTimer = (id: string, remaining: number) => {
  const timeout = setTimeout(() => removeToast(id), remaining)
  timersStore.get().set(id, {
    timeout,
    remaining,
    startedAt: Date.now(),
  })
}

export const removeToast = (id: string) => {
  const timer = timersStore.get().get(id)
  if (timer?.timeout) {
    clearTimeout(timer.timeout)
  }
  timersStore.get().delete(id)

  const items = itemsStore.get()
  const next = items.filter(e => e.id !== id)
  if (next.length < items.length) {
    itemsStore.set(next)
    notify()
  }
}

// stops the countdown without losing the remaining time - call resumeToast
// to reschedule it, e.g. while the user is hovering/reading the toast
export const pauseToast = (id: string) => {
  const timer = timersStore.get().get(id)
  if (!timer?.timeout) {
    return
  }
  clearTimeout(timer.timeout)
  const elapsed = Date.now() - timer.startedAt
  timersStore.get().set(id, {
    remaining: Math.max(0, timer.remaining - elapsed),
    startedAt: Date.now(),
  })
}

export const resumeToast = (id: string) => {
  const timer = timersStore.get().get(id)
  if (!timer || timer.timeout) {
    return
  }
  scheduleTimer(id, timer.remaining)
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

  scheduleTimer(id, duration)

  return id
}
