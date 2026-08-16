'use client'

import { Progress } from 'rntwsc/components/progress'
import { H1, Span } from 'rntwsc/components/text'
import { upperFirst } from 'rntwsc/libs/lodash'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

const types = [
  'basic',
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const
const sizes = ['sm', 'md', 'lg'] as const
const shapes = ['rounded', 'pill'] as const

export const ProgressPage = () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <View className='flex-row items-center gap-3'>
            <H1 className='text-foreground text-2xl font-semibold transition'>
              Progress
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              type
            </Span>
            <View className='gap-3'>
              {types.map(type => (
                <View key={type} className='gap-1.5'>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(type)}
                  </Span>
                  <Progress type={type} value={60} />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='gap-3'>
              {sizes.map(size => (
                <View key={size} className='gap-1.5'>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(size)}
                  </Span>
                  <Progress size={size} value={40} />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              shape
            </Span>
            <View className='gap-3'>
              {shapes.map(shape => (
                <View key={shape} className='gap-1.5'>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(shape)}
                  </Span>
                  <Progress shape={shape} value={75} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
