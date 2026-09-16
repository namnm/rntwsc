export const serverCacheKey = <T extends string[]>(scope: string, keys: T) => {
  const m = {} as { [k in T[number]]: string }
  keys.forEach(k => {
    m[k as T[number]] = `${scope}/${k}`
  })
  return m
}
