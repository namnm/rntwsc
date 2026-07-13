import { mergeWithArray } from '@rntwsc/core/lodash'
import { twrncConfig as coreConfig } from '@rntwsc/core/tw/twrnc-config'
import type { TwConfig } from '@rntwsc/core/utils/twrnc'

const override: TwConfig = {
  //
}

export const twrncConfig: TwConfig = mergeWithArray({}, coreConfig, override)
