import type { Falsish, StrMap } from '#/libs/utility-types'

export const mergeDefault = <T extends StrMap<unknown>>(
  value: T,
  defaultValue: Partial<T> | Falsish,
): T => {
  if (!defaultValue) {
    return value
  }
  value = {
    ...value,
  }
  Object.keys(defaultValue).forEach(k => {
    if (value[k] === undefined) {
      // @ts-ignore
      value[k] = defaultValue[k]
    }
  })
  return value
}
