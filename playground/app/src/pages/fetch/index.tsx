import { H1 } from 'rntwsc/components/text'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '#/components/nav-layout'
import { FetchClient } from '#/pages/fetch/fetch-client'
import { FetchServer } from '#/pages/fetch/fetch-server'

export const FetchPage = () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <H1 className='text-foreground text-2xl font-semibold transition'>
            Fetch
          </H1>
          <FetchServer label='server 1' />
          <FetchClient label='client 1' refetch />
          <FetchServer label='server 2' />
          <FetchClient label='client 2' />
          <FetchServer label='server 3' />
          <FetchClient label='client 3' />
        </View>
      </ScrollView>
    </NavLayout>
  )
}
