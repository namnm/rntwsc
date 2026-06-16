import { H1 } from '@/core/components/text'
import { useSafeAreaPadding } from '@/core/responsive/use-safe-area'
import { ScrollView } from '@/core/tw/components/scroll-view'
import { View } from '@/core/tw/components/view'
import { NavLayout } from '#/components/nav-layout'
import { GraphQLClient } from '#/pages/graphql/graphql-client'
import { GraphQLServer } from '#/pages/graphql/graphql-server'

export const GraphQLPage = () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <H1 className='text-foreground text-2xl font-semibold transition'>
            GraphQL
          </H1>
          <GraphQLServer label='server 1' />
          <GraphQLClient label='client 1' refetch />
          <GraphQLServer label='server 2' />
          <GraphQLClient label='client 2' />
          <GraphQLServer label='server 3' />
          <GraphQLClient label='client 3' />
        </View>
      </ScrollView>
    </NavLayout>
  )
}
