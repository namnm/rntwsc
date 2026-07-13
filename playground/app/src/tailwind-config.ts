// nodejs code here

import { mergeWithArray } from '@rntwsc/core/lodash'
import { config as coreConfig } from '@rntwsc/core/tw/tailwind-config'
import { path } from '@rntwsc/devtools/path'
import type { Config } from 'tailwindcss'

const override: Config = {
  content: [path.join(__dirname, './**/*.{ts,tsx}')],
}

export const config: Config = mergeWithArray({}, coreConfig, override)
