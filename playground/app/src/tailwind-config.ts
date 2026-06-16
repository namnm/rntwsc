// nodejs code here

import type { Config } from 'tailwindcss'

import { config as coreConfig } from '@/core/tw/tailwind-config'
import { path } from '@/nodejs/path'
import { mergeWithArray } from '@/shared/lodash'

const override: Config = {
  content: [path.join(__dirname, './**/*.{ts,tsx}')],
}

export const config: Config = mergeWithArray({}, coreConfig, override)
