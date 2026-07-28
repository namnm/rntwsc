import { Span } from 'rntwsc/components/text'
import type { GraphQLResponse } from 'rntwsc/graphql/config'
import type { UseHydrationData } from 'rntwsc/hydration/config'
import { jsonSafe } from 'rntwsc/libs/json-safe'
import { View } from 'rntwsc/tw/components/view'

import type { HelloData } from '@/pages/graphql/config'

type Props = UseHydrationData<GraphQLResponse<HelloData>>

export const GraphQLUi = ({ data, loading, error }: Props) => {
  if (loading) {
    return <Span className='text-foreground transition'>loading..</Span>
  }
  if (error) {
    return <Span className='text-red-500 transition'>{error}</Span>
  }
  const hello = data?.data?.hello
  return (
    <View className='gap-2'>
      <Span className='text-foreground transition'>
        message: {hello?.message}
      </Span>
      <Span className='text-foreground transition'>
        timestamp: {hello?.timestamp}
      </Span>
      {data?.errors && (
        <Span className='text-red-500 transition'>
          errors: {jsonSafe(data.errors)}
        </Span>
      )}
    </View>
  )
}
