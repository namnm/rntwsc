'use client'

import { useState } from 'react'

import { DatePicker } from '@/rn/components/date-picker'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { upperFirst } from '@/shared/lodash'
import { NavLayout } from '#/components/nav-layout'

const appearances = ['outlined', 'filled', 'ghost', 'underlined'] as const
const sizes = ['sm', 'md', 'lg'] as const
const shapes = ['rounded', 'pill', 'none'] as const

export const DatePickerPage = () => {
  const padding = useSafeAreaPadding()
  const [controlled, setControlled] = useState<Date | undefined>(new Date())

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <View className='flex-row items-center gap-3'>
            <H1 className='text-foreground text-2xl font-semibold transition'>
              Date Picker
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              appearance
            </Span>
            <View className='gap-3'>
              {appearances.map(appearance => (
                <View key={appearance} className='gap-1.5'>
                  <Span className='text-foreground text-xs transition'>
                    {upperFirst(appearance)}
                  </Span>
                  <DatePicker
                    appearance={appearance}
                    placeholder='Select a date..'
                  />
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
                  <DatePicker size={size} placeholder='Select a date..' />
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
                  <DatePicker shape={shape} placeholder='Select a date..' />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              controlled
            </Span>
            <DatePicker value={controlled} onChange={setControlled} />
            <Span className='text-foreground text-xs transition'>
              Selected:{' '}
              {controlled
                ? controlled.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })
                : '-'}
            </Span>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <DatePicker defaultValue={new Date()} disabled />
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
