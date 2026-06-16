'use client'

import { useEffect } from 'react'

import { isBrowser } from '@/core/platform'
import { rnwClassName } from '@/core/tw/lib/react-native-web'

if (isBrowser) {
  // @ts-ignore
  window.rnwClassName = rnwClassName
}

export const ReactNativeWebEnhancer = () => {
  // tested and realized we always need a useEffect
  // so nextjs will execute this file on browser correctly
  useEffect(() => undefined, [])
  return null
}
