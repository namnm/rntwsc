'use client'

import '#/polyfill/shared'
import '#/polyfill/init-minified-class-names'

import { Portal } from 'rntwsc/components/portal'
import { ReactNativeWebEnhancer } from 'rntwsc/tw/polyfill/react-native-web-enhancer'

export const BrowserEnhancers = () => (
  <>
    <ReactNativeWebEnhancer />
    <Portal.Root />
  </>
)
