'use client'

import { Button } from '@rntwsc/core/components/button'
import { Span } from '@rntwsc/core/components/text'
import { useFetch } from '@rntwsc/core/fetch'
import { View } from '@rntwsc/core/tw/components/view'

import { playgroundFetchUrl } from '#/pages/fetch/config'
import type { HelloData } from '#/pages/fetch/fetch-ui'
import { FetchUi } from '#/pages/fetch/fetch-ui'

type Props = {
  label: string
  refetch?: boolean
}
export const FetchClient = async ({ label, refetch }: Props) => {
  const r = await useFetch<HelloData>({
    url: playgroundFetchUrl + '?client=true',
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
