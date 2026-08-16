import { Span } from 'rntwsc/components/text'
import { jsonSafe } from 'rntwsc/libs/json-safe'
import { View } from 'rntwsc/tw/components/view'

import type { useFetchHello } from '@/codegen/graphql.min'

type Props = Awaited<ReturnType<typeof useFetchHello>>

export const GraphQLUi = ({ data, loading, error, errors }: Props) => {
  if (loading) {
    return <Span className='text-foreground transition'>loading..</Span>
  }
  if (error) {
    return <Span className='text-red-500 transition'>{`${error}`}</Span>
  }
  return (
    <View className='gap-2'>
      {!data ? (
        <Span className='text-red-500 transition'>!data</Span>
      ) : (
        <>
          <Span className='text-foreground transition'>
            message: {data?.message}
          </Span>
          <Span className='text-foreground transition'>
            timestamp: {data?.timestamp}
          </Span>
        </>
      )}
      {errors && (
        <Span className='text-red-500 transition'>
          errors: {jsonSafe(errors)}
        </Span>
      )}
    </View>
  )
}
