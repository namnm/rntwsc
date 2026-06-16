import { twrncConfig as coreConfig } from '@/core/tw/twrnc-config'
import type { TwConfig } from '@/core/utils/twrnc'
import { mergeWithArray } from '@/shared/lodash'

const override: TwConfig = {
  //
}

export const twrncConfig: TwConfig = mergeWithArray({}, coreConfig, override)
