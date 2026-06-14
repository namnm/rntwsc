'use client'

import { useEffect } from 'react'

import { rnwClassName } from '@/rn/core/tw/lib/react-native-web'
import { isBrowser } from '@/rn/platform'

if (isBrowser) {
  // @ts-ignore
  window.rnwClassName = rnwClassName
}

export const ReactNativeWebEnhancer = () => {
  // tested and realized we always need a useEffect
  // so nextjs will execute this file on browser correctly
  useEffect(() => {}, [])
  return null
}
