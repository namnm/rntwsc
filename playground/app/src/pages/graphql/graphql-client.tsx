'use client'

import { Button } from 'rntwsc/components/button'
import { Span } from 'rntwsc/components/text'
import { useFetchGraphQL } from 'rntwsc/graphql'
import { View } from 'rntwsc/tw/components/view'

import type { HelloData } from '@/pages/graphql/config'
import { HELLO_QUERY, playgroundGraphQLUrl } from '@/pages/graphql/config'
import { GraphQLUi } from '@/pages/graphql/graphql-ui'

type Props = {
  label: string
  refetch?: boolean
}
export const GraphQLClient = async ({ label, refetch }: Props) => {
  const r = await useFetchGraphQL<HelloData>({
    url: playgroundGraphQLUrl + '?client=true',
    query: HELLO_QUERY,
  })
  return (
    <View className='gap-2'>
      <Span className='text-foreground text-lg font-semibold transition'>
        {label}
      </Span>
      <GraphQLUi {...r} />
      {refetch && (
        <View className='flex-row'>
          <Button onPress={r.refetch}>Refetch</Button>
        </View>
      )}
    </View>
  )
}
