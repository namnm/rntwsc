'use client'

import '#/polyfill/shared'
import '#/polyfill/init-minified-class-names'

import { Portal } from '@/rn/components/portal'
import { ReactNativeWebEnhancer } from '@/rn/core/polyfill/react-native-web-client'

export const ClientEnhancer = () => (
  <>
    <ReactNativeWebEnhancer />
    <Portal.Root />
  </>
)
