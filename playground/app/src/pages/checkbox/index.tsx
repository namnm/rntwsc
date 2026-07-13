'use client'

import { Checkbox } from '@rntwsc/core/components/checkbox'
import { H1, Span } from '@rntwsc/core/components/text'
import { Minus } from '@rntwsc/core/icons/minus'
import { Plus } from '@rntwsc/core/icons/plus'
import { upperFirst } from '@rntwsc/core/lodash'
import { useSafeAreaPadding } from '@rntwsc/core/responsive/use-safe-area'
import { ScrollView } from '@rntwsc/core/tw/components/scroll-view'
import { View } from '@rntwsc/core/tw/components/view'

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

export const CheckboxPage = () => {
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
              Checkbox
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              type
            </Span>
            <View className='flex-row flex-wrap gap-4'>
              {types.map(type => (
                <View key={type} className='items-center gap-1.5'>
                  <Checkbox type={type} defaultChecked />
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
                  <Checkbox size={size} defaultChecked />
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
              <Checkbox disabled />
              <Checkbox disabled defaultChecked />
            </View>
          </View>
          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              custom indicator
            </Span>
            <View className='flex-row gap-4'>
              <Checkbox defaultChecked>
                <Checkbox.Indicator asChild>
                  <Minus />
                </Checkbox.Indicator>
              </Checkbox>
              <Checkbox defaultChecked>
                <Checkbox.Indicator asChild>
                  <Plus />
                </Checkbox.Indicator>
              </Checkbox>
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
