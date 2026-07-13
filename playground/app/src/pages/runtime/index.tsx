import { H1 } from '@rntwsc/core/components/text'
import { useSafeAreaPadding } from '@rntwsc/core/responsive/use-safe-area'
import { ScrollView } from '@rntwsc/core/tw/components/scroll-view'
import { View } from '@rntwsc/core/tw/components/view'

import { NavLayout } from '#/components/nav-layout'
import { DemoRuntime } from '#/pages/home/runtime'

export const RuntimePage = async () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <H1 className='text-foreground text-2xl font-semibold transition'>
            Runtime Style
          </H1>
          <DemoRuntime />
        </View>
      </ScrollView>
    </NavLayout>
  )
}
