'use client'

import { Button } from 'rntwsc/components/button'
import { Span } from 'rntwsc/components/text'
import { View } from 'rntwsc/tw/components/view'

import { useFetchHello } from '@/codegen/graphql.min'
import { GraphQLUi } from '@/pages/graphql/graphql-ui'

type Props = {
  label: string
  refetch?: boolean
}
export const GraphQLClient = async ({ label, refetch }: Props) => {
  const r = await useFetchHello({
    select: p => p.message.timestamp,
    keySalt: 'client',
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
