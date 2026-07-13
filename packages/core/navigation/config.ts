import { serverCacheKey } from '@/core/cache/key'

export const sck = serverCacheKey('rntwsc/navigation', ['route'] as const)

export const urlHeaderKey = 'x-request-url'
