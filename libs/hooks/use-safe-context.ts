'use client'

import type { Context } from 'react'
import { useContext } from 'react'

export const useSafeContext = <T>(Ctx: Context<T | undefined>): T => {
  const v = useContext(Ctx)
  if (v === undefined) {
    throw new Error('Invalid context call')
  }
  return v
}
