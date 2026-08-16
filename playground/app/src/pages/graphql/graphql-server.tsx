import { Span } from 'rntwsc/components/text'
import { View } from 'rntwsc/tw/components/view'

import { useFetchHello } from '@/codegen/graphql.min'
import { GraphQLUi } from '@/pages/graphql/graphql-ui'

type Props = {
  label: string
}
export const GraphQLServer = async ({ label }: Props) => {
  const r = await useFetchHello({
    select: p => p.message.timestamp,
  })
  return (
    <View className='gap-2'>
      <Span className='text-foreground text-lg font-semibold transition'>
        {label}
      </Span>
      <GraphQLUi {...r} />
    </View>
  )
}
