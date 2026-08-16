'use client'

import { useState } from 'react'
import { Slider } from 'rntwsc/components/slider'
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

export const SliderPage = () => {
  const padding = useSafeAreaPadding()
  const [controlled, setControlled] = useState(30)

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <View className='flex-row items-center gap-3'>
            <H1 className='text-foreground text-2xl font-semibold transition'>
              Slider
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              controlled
            </Span>
            <Slider
              value={controlled}
              onChange={v => setControlled(Math.round(v))}
            />
            <Span className='text-foreground text-xs transition'>
              value: {controlled}
            </Span>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              type
            </Span>
            <View className='gap-4'>
              {types.map(type => (
                <View key={type} className='gap-1.5'>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(type)}
                  </Span>
                  <Slider type={type} defaultValue={50} />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='gap-4'>
              {sizes.map(size => (
                <View key={size} className='gap-1.5'>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(size)}
                  </Span>
                  <Slider size={size} defaultValue={50} />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              step
            </Span>
            <Slider defaultValue={20} step={10} />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <Slider defaultValue={40} disabled />
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
