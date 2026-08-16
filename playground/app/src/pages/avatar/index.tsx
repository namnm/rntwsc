'use client'

import { Avatar } from 'rntwsc/components/avatar'
import { H1, Span } from 'rntwsc/components/text'
import { upperFirst } from 'rntwsc/libs/lodash'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const shapes = ['circle', 'rounded', 'square'] as const

export const AvatarPage = () => {
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
              Avatar
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='flex-row flex-wrap items-center gap-4'>
              {sizes.map(size => (
                <View key={size} className='items-center gap-1.5'>
                  <Avatar size={size}>
                    <Avatar.Fallback>NN</Avatar.Fallback>
                  </Avatar>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(size)}
                  </Span>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              shape
            </Span>
            <View className='flex-row flex-wrap items-center gap-4'>
              {shapes.map(shape => (
                <View key={shape} className='items-center gap-1.5'>
                  <Avatar shape={shape}>
                    <Avatar.Fallback>NN</Avatar.Fallback>
                  </Avatar>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(shape)}
                  </Span>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              image with fallback
            </Span>
            <View className='flex-row flex-wrap items-center gap-4'>
              <View className='items-center gap-1.5'>
                <Avatar size='lg'>
                  <Avatar.Image src='https://i.pravatar.cc/150?img=12' />
                  <Avatar.Fallback>NN</Avatar.Fallback>
                </Avatar>
                <Span className='text-foreground text-xs transition'>
                  loads
                </Span>
              </View>
              <View className='items-center gap-1.5'>
                <Avatar size='lg'>
                  <Avatar.Image src='https://example.invalid/broken.png' />
                  <Avatar.Fallback>NN</Avatar.Fallback>
                </Avatar>
                <Span className='text-foreground text-xs transition'>
                  fails, shows fallback
                </Span>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
