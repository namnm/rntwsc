import { pnpmWorkspaceSync } from 'rntwsc/devtools/normalize/pnpm-workspace'

// vitest always runs from the repo root - see root package.json's "test" script
const readReactNativeVersion = (): string => {
  let v = ''
  try {
    v = pnpmWorkspaceSync(process.cwd()).overrides?.['react-native'] || ''
  } catch {}
  if (!v) {
    console.error('Can not get react native version from process cwd')
    process.exit(1)
  }
  return v
}

export const reactNativeVersion = readReactNativeVersion()
