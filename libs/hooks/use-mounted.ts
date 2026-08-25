'use client'

import { useEffect, useState } from 'react'

export const useIsMounted = () => {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}

export const useOnMounted = (fn: (() => void) | (() => () => void)) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fn, [])

export const useOnUnmounted = (fn: () => void) => useOnMounted(() => fn)
