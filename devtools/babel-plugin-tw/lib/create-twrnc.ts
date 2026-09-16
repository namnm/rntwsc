import type { Platform } from 'react-native'
import type { TwConfig } from 'twrnc'
import { create } from 'twrnc/create'

// can not import twrnc directly as it imports react-native which is not available in nodejs babel env
export const createTwrnc = (
  twrncConfig: TwConfig,
  platform: Platform['OS'],
  reactNativeVersion: string,
) => {
  const matches = /(\d+)\.(\d+)\.(\d+)/.exec(reactNativeVersion)
  if (!matches) {
    throw new Error(
      'Can not read react native version from pnpm-workspace.yaml',
    )
  }
  const rnVersion = {
    major: Number(matches[1]),
    minor: Number(matches[2]),
    patch: Number(matches[3]),
  }

  return create(twrncConfig, platform, rnVersion).style
}

export type Twrnc = ReturnType<typeof createTwrnc>
