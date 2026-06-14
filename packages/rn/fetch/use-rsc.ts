import { headers } from 'next-unchecked/headers'
import { cache } from 'react'

const rscHeaderKeys = ['X-Nextjs-Request-Id', 'X-Nextjs-Html-Request-Id']

export const useRsc = cache(async () => {
  const h = await headers()
  return rscHeaderKeys.some(k => h.get(k))
})
