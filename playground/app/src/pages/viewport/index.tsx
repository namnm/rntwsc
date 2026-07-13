import { H1, Span } from '@rntwsc/core/components/text'
import { useSafeAreaPadding } from '@rntwsc/core/responsive/use-safe-area'
import { ScrollView } from '@rntwsc/core/tw/components/scroll-view'
import { View } from '@rntwsc/core/tw/components/view'

import { NavLayout } from '#/components/nav-layout'

const DemoBox = ({
  label,
  className,
}: {
  label: string
  className: string
}) => (
  <View
    className={['bg-primary/20 h-12 justify-center rounded p-2', className]}
  >
    <Span className='text-primary text-xs transition'>{label}</Span>
  </View>
)

export const ViewportPage = async () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <H1 className='text-foreground text-2xl font-semibold transition'>
            Viewport Units
          </H1>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              simple vw / vh
            </Span>
            <DemoBox label='w-[25vw]' className='w-[25vw]' />
            <DemoBox label='w-[50vw]' className='w-[50vw]' />
            <DemoBox label='w-[75vw]' className='w-[75vw]' />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              calc - subtract
            </Span>
            <DemoBox
              label='w-[calc(100vw-32px)]'
              className='w-[calc(100vw-32px)]'
            />
            <DemoBox
              label='w-[calc(100vw-96px)]'
              className='w-[calc(100vw-96px)]'
            />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              calc - divide
            </Span>
            <DemoBox label='w-[calc(100vw/2)]' className='w-[calc(100vw/2)]' />
            <DemoBox label='w-[calc(100vw/3)]' className='w-[calc(100vw/3)]' />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              calc - mixed
            </Span>
            <DemoBox
              label='w-[calc(50vw+40px)]'
              className='w-[calc(50vw+40px)]'
            />
            <DemoBox
              label='w-[calc(100vw/2-16px)]'
              className='w-[calc(100vw/2-16px)]'
            />
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
