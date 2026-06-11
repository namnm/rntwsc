'use client'

import { Switch } from '@/rn/components/switch'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { upperFirst } from '@/shared/lodash'
import { NavLayout } from '#/components/nav-layout'

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

export const SwitchPage = () => {
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
              Switch
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              type
            </Span>
            <View className='flex-row flex-wrap gap-4'>
              {types.map(type => (
                <View key={type} className='items-center gap-1.5'>
                  <Switch type={type} defaultValue />
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(type)}
                  </Span>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='flex-row flex-wrap items-center gap-4'>
              {sizes.map(size => (
                <View key={size} className='items-center gap-1.5'>
                  <Switch size={size} defaultValue />
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(size)}
                  </Span>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <View className='flex-row gap-4'>
              <Switch disabled />
              <Switch disabled defaultValue />
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
