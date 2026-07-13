import { Span } from '@rntwsc/core/components/text'
import { useFetch } from '@rntwsc/core/fetch'
import { View } from '@rntwsc/core/tw/components/view'

import { playgroundFetchUrl } from '#/pages/fetch/config'
import type { HelloData } from '#/pages/fetch/fetch-ui'
import { FetchUi } from '#/pages/fetch/fetch-ui'

type Props = {
  label: string
}
export const FetchServer = async ({ label }: Props) => {
  const r = await useFetch<HelloData>({
    url: playgroundFetchUrl,
  })
  return (
    <View className='gap-2'>
      <Span className='text-foreground text-lg font-semibold transition'>
        {label}
      </Span>
      <View className='gap-2'>
        <FetchUi {...r} />
      </View>
    </View>
  )
}
