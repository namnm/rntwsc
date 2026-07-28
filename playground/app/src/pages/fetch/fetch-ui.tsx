import { Span } from 'rntwsc/components/text'
import type { UseHydrationData } from 'rntwsc/hydration/config'
import { View } from 'rntwsc/tw/components/view'

export type HelloData = { message: string; timestamp: number }

type Props = UseHydrationData<HelloData>

export const FetchUi = ({ data, loading, error }: Props) => {
  if (loading) {
    return <Span className='text-foreground transition'>loading..</Span>
  }
  if (error) {
    return <Span className='text-red-500 transition'>{String(error)}</Span>
  }
  return (
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
