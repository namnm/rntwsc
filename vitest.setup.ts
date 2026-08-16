// Tests never mount ReactNativeWebEnhancer, so import the polyfill's side
// effects directly - see docs/contribution/dev.md "Running unit tests".
import '#/core/tw/polyfill/react-native-web'
import '@testing-library/jest-dom/vitest'

import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// @testing-library/react's auto-cleanup needs Jest's global afterEach,
// which vitest.config.ts doesn't enable - see docs/contribution/dev.md.
afterEach(() => {
  cleanup()
})
