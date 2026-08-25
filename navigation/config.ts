import { serverCacheKey } from 'rntwsc/cache/key'

export const sck = serverCacheKey('rntwsc/navigation', ['route'] as const)

export const urlHeaderKey = 'x-request-url'
