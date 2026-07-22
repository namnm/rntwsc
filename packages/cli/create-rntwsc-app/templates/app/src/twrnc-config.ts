import { mergeWithArray } from 'rntwsc/libs/lodash'
import type { TwConfig } from 'rntwsc/libs/twrnc'
import { twrncConfig as coreConfig } from 'rntwsc/tw/twrnc-config'

const override: TwConfig = {
  //
}

export const twrncConfig: TwConfig = mergeWithArray({}, coreConfig, override)
