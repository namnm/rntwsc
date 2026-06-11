'use client'

import { useState } from 'react'

import { ToggleGroup, ToggleItem } from '@/rn/components/button-toggle-group'
import { Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'

const shapes = ['none', 'rounded', 'pill'] as const
const sizes = ['sm', 'md', 'lg'] as const

export const ButtonToggleGroupPage = () => {
  const padding = useSafeAreaPadding()
  const [period, setPeriod] = useState('week')
  const [days, setDays] = useState<string[]>(['wed', 'sun'])

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <Span className='text-foreground text-2xl font-semibold transition'>
            Button Toggle Group
          </Span>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              single
            </Span>
            <ToggleGroup value={period} onChange={setPeriod}>
              <ToggleItem value='day'>Day</ToggleItem>
              <ToggleItem value='week'>Week</ToggleItem>
              <ToggleItem value='month'>Month</ToggleItem>
            </ToggleGroup>
            <Span className='text-foreground italic transition'>
              selected: {period || '-'}
            </Span>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              multiple
            </Span>
            <ToggleGroup multiple value={days} onChange={setDays}>
              <ToggleItem value='mon'>Mon</ToggleItem>
              <ToggleItem value='wed'>Wed</ToggleItem>
              <ToggleItem value='fri'>Fri</ToggleItem>
              <ToggleItem value='sun'>Sun</ToggleItem>
            </ToggleGroup>
            <Span className='text-foreground italic transition'>
              selected: {days.join(', ') || '-'}
            </Span>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            {sizes.map(size => (
              <View key={size} className='gap-3'>
                <Span className='text-foreground italic transition'>
                  {size}
                </Span>
                <ToggleGroup defaultValue='2' size={size}>
                  <ToggleItem value='1'>One</ToggleItem>
                  <ToggleItem value='2'>Two</ToggleItem>
                  <ToggleItem value='3'>Three</ToggleItem>
                </ToggleGroup>
              </View>
            ))}
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              shape
            </Span>
            {shapes.map(shape => (
              <View key={shape} className='gap-3'>
                <Span className='text-foreground italic transition'>
                  {shape}
                </Span>
                <ToggleGroup defaultValue='2' shape={shape}>
                  <ToggleItem value='1'>One</ToggleItem>
                  <ToggleItem value='2'>Two</ToggleItem>
                  <ToggleItem value='3'>Three</ToggleItem>
                </ToggleGroup>
              </View>
            ))}
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              mixed
            </Span>

            <View className='gap-3'>
              <Span className='text-foreground italic transition'>
                outline soft
              </Span>
              <ToggleGroup
                defaultValue='1'
                appearance='outline'
                activeAppearance='soft'
              >
                <ToggleItem value='1'>One</ToggleItem>
                <ToggleItem value='2'>Two</ToggleItem>
                <ToggleItem value='3'>Three</ToggleItem>
              </ToggleGroup>
            </View>

            <View className='gap-3'>
              <Span className='text-foreground italic transition'>
                ghost soft
              </Span>
              <ToggleGroup
                defaultValue='2'
                appearance='ghost'
                activeAppearance='soft'
              >
                <ToggleItem value='1'>One</ToggleItem>
                <ToggleItem value='2'>Two</ToggleItem>
                <ToggleItem value='3'>Three</ToggleItem>
              </ToggleGroup>
            </View>

            <View className='gap-3'>
              <Span className='text-foreground italic transition'>
                mixed type
              </Span>
              <ToggleGroup defaultValue='3'>
                <ToggleItem value='1' type='success'>
                  One
                </ToggleItem>
                <ToggleItem value='2' type='primary'>
                  Two
                </ToggleItem>
                <ToggleItem value='3' type='error'>
                  Three
                </ToggleItem>
              </ToggleGroup>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <ToggleGroup defaultValue='2'>
              <ToggleItem value='1'>One</ToggleItem>
              <ToggleItem value='2'>Two</ToggleItem>
              <ToggleItem value='3' disabled>
                Three
              </ToggleItem>
            </ToggleGroup>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled (root)
            </Span>
            <ToggleGroup defaultValue='2' disabled>
              <ToggleItem value='1'>One</ToggleItem>
              <ToggleItem value='2'>Two</ToggleItem>
              <ToggleItem value='3'>Three</ToggleItem>
            </ToggleGroup>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
