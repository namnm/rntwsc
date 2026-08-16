'use client'

import { Button } from 'rntwsc/components/button'
import { Span } from 'rntwsc/components/text'
import { useFetch } from 'rntwsc/fetch'
import { View } from 'rntwsc/tw/components/view'

import { playgroundFetchUrl } from '@/pages/fetch/config'
import type { HelloData } from '@/pages/fetch/fetch-ui'
import { FetchUi } from '@/pages/fetch/fetch-ui'

type Props = {
  label: string
  refetch?: boolean
}
export const FetchClient = async ({ label, refetch }: Props) => {
  const r = await useFetch<HelloData>({
    url: playgroundFetchUrl,
    keySalt: 'client',
  })
  return (
    <View className='gap-2'>
      <Span className='text-foreground text-lg font-semibold transition'>
        {label}
      </Span>
      <View className='gap-2'>
        <FetchUi {...r} />
        {refetch && (
          <View className='flex-row'>
            <Button onPress={r.refetch}>Refetch</Button>
          </View>
        )}
      </View>
    </View>
  )
}
