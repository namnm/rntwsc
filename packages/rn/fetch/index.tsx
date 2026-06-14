import { dehydrate } from '@/rn/fetch/dehydrate'
import type { UseFetchData } from '@/rn/fetch/store'

export const useFetch = async <T,>(
  url: string,
  key = url,
): Promise<UseFetchData<T>> => {
  const data: Omit<UseFetchData<T>, 'refetch' | 'dehydrateJsx'> = {}
  try {
    const r = await fetch(url)
    if (!r.ok) {
      throw new Error(`${r.status} ${r.statusText}`)
    }
    data.data = await r.json()
  } catch (err) {
    data.err = String(err)
  }
  return dehydrate(key, data)
}
