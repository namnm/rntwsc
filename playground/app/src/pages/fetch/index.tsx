import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { useFetch } from '@/rn/fetch'
import { NavLayout } from '#/components/nav-layout'
import { FetchClient } from '#/pages/fetch/fetch-client'
import type { HelloData } from '#/pages/fetch/fetch-ui'
import { FetchUi } from '#/pages/fetch/fetch-ui'

const API_URL = 'http://localhost:3001/api/fetch'

export const FetchPage = async () => {
  const r = await useFetch<HelloData>(API_URL)
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

          <View className='gap-2'>
            <Span className='text-foreground text-lg font-semibold transition'>
              server
            </Span>
            <FetchUi {...r} />
          </View>

          <View className='gap-2'>
            <Span className='text-foreground text-lg font-semibold transition'>
              client
            </Span>
            <FetchClient url={API_URL} />
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
