import { H1 } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'
import { useDemoRefs } from '#/pages/home/refs'

export const NativeRefsPage = async () => {
  const padding = useSafeAreaPadding()
  const [demoRefs, demoRefsNative] = useDemoRefs()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <H1 className='text-foreground text-2xl font-semibold transition'>
            Native Refs
          </H1>
          {demoRefs}
        </View>
      </ScrollView>
      {/* need to render outside of scroll view on native */}
      {demoRefsNative}
    </NavLayout>
  )
}
