import type { StableStringifyOptions } from 'json-stable-stringify'
import jsonStableStringify from 'json-stable-stringify'

import { jsonSafe } from 'rntwsc/libs/json-safe'
import type { Falsish } from 'rntwsc/libs/utility-types'

export const jsonStable = (v: unknown, options?: StableStringifyOptions) => {
  let j: string | Falsish
  try {
    j = jsonStableStringify(v, options)
  } catch (err) {
    void err
    // try to fix circular json
    j = jsonStableStringify(JSON.parse(jsonSafe(v)), options)
  }
  if (!j) {
    throw new Error('Empty json stable stringify')
  }
  return j
}
