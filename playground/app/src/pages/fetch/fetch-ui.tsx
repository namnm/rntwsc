import { Span } from '@rntwsc/core/components/text'
import type { UseHydrationData } from '@rntwsc/core/hydration/config'
import { View } from '@rntwsc/core/tw/components/view'

export type HelloData = { message: string; timestamp: number }

type Props = UseHydrationData<HelloData>

export const FetchUi = ({ data, loading, error, dehydrateJsx }: Props) => {
  let children = null
  if (loading) {
    children = <Span className='text-foreground transition'>loading..</Span>
  } else if (error) {
    children = <Span className='text-red-500 transition'>{String(error)}</Span>
  } else {
    children = (
      <View className='gap-2'>
        <Span className='text-foreground transition'>
          message: {data?.message}
        </Span>
        <Span className='text-foreground transition'>
          timestamp: {data?.timestamp}
        </Span>
      </View>
    )
  }
  return (
    <>
      {children}
      {dehydrateJsx}
    </>
  )
}
