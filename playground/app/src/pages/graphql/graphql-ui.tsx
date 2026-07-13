import { Span } from 'rntwsc/components/text'
import type { GraphQLResponse } from 'rntwsc/graphql/config'
import type { UseHydrationData } from 'rntwsc/hydration/config'
import { jsonSafe } from 'rntwsc/libs/json-safe'
import { View } from 'rntwsc/tw/components/view'

import type { HelloData } from '#/pages/graphql/config'

type Props = UseHydrationData<GraphQLResponse<HelloData>>

export const GraphQLUi = ({ data, loading, error, dehydrateJsx }: Props) => {
  let children = null
  if (loading) {
    children = <Span className='text-foreground transition'>loading..</Span>
  } else if (error) {
    children = <Span className='text-red-500 transition'>{error}</Span>
  } else {
    const hello = data?.data?.hello
    children = (
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
  return (
    <>
      {children}
      {dehydrateJsx}
    </>
  )
}
