// nodejs code here

import { path } from 'rntwsc/devtools/path'
import { mergeWithArray } from 'rntwsc/libs/lodash'
import { config as coreConfig } from 'rntwsc/tw/tailwind-config'
import type { Config } from 'tailwindcss'

const override: Config = {
  content: [path.join(__dirname, './**/*.{ts,tsx}')],
}

export const config: Config = mergeWithArray({}, coreConfig, override)
