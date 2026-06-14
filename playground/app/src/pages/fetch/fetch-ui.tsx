import { Span } from '@/rn/components/text'
import { View } from '@/rn/core/components/view'
import type { UseFetchData } from '@/rn/fetch/store'

export type HelloData = { message: string; timestamp: number }

type Props = UseFetchData<HelloData>

export const FetchUi = ({ data, loading, err, dehydrateJsx }: Props) => {
  let children = null
  if (loading) {
    children = <Span className='text-foreground transition'>loading..</Span>
  } else if (err) {
    children = <Span className='text-red-500 transition'>{String(err)}</Span>
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
