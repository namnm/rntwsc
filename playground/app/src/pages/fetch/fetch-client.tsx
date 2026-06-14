'use client'

import { Button } from '@/rn/components/button'
import { View } from '@/rn/core/components/view'
import { useFetch } from '@/rn/fetch'
import type { HelloData } from '#/pages/fetch/fetch-ui'
import { FetchUi } from '#/pages/fetch/fetch-ui'

export const FetchClient = async ({ url }: { url: string }) => {
  const r = await useFetch<HelloData>(url + '?client=true')
  return (
    <View className='gap-2'>
      <FetchUi {...r} />
      <Button onPress={r.refetch}>Refetch</Button>
    </View>
  )
}
