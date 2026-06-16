import { Span } from '@/core/components/text'
import { useApollo } from '@/core/graphql'
import { View } from '@/core/tw/components/view'
import type { HelloData } from '#/pages/graphql/config'
import { HELLO_QUERY, playgroundGraphQLUrl } from '#/pages/graphql/config'
import { GraphQLUi } from '#/pages/graphql/graphql-ui'

type Props = {
  label: string
}
export const GraphQLServer = async ({ label }: Props) => {
  const r = await useApollo<HelloData>({
    url: playgroundGraphQLUrl,
    query: HELLO_QUERY,
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
