'use client'

import { useState } from 'react'
import type { ComboboxItem } from 'rntwsc/components/combobox'
import { Combobox } from 'rntwsc/components/combobox'
import { H1, Span } from 'rntwsc/components/text'
import { upperFirst } from 'rntwsc/libs/lodash'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

const appearances = ['outlined', 'filled', 'ghost', 'underlined'] as const
const sizes = ['sm', 'md', 'lg'] as const

const countries: ComboboxItem[] = [
  {
    value: 'us',
    label: 'United States of America',
  },
  {
    value: 'gb',
    label: 'United Kingdom',
  },
  {
    value: 'au',
    label: 'Australia',
  },
  {
    value: 'nz',
    label: 'New Zealand',
  },
  {
    value: 'za',
    label: 'South Africa',
  },
  {
    value: 'kr',
    label: 'South Korea',
  },
]

export const ComboboxPage = () => {
  const padding = useSafeAreaPadding()
  const [controlled, setControlled] = useState('')

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <View className='flex-row items-center gap-3'>
            <H1 className='text-foreground text-2xl font-semibold transition'>
              Combobox
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              controlled
            </Span>
            <Span className='text-foreground text-xs transition'>
              try: "uni", "south", "new z"
            </Span>
            <Combobox
              items={countries}
              placeholder='Search a country..'
              value={controlled}
              onChange={setControlled}
            />
            <Span className='text-foreground text-xs transition'>
              Selected: {controlled || '-'}
            </Span>
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
                  <Combobox
                    appearance={appearance}
                    items={countries}
                    placeholder='Search a country..'
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
                  <Combobox
                    size={size}
                    items={countries}
                    placeholder='Search a country..'
                  />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              no results
            </Span>
            <Span className='text-foreground text-xs transition'>
              try: "zzz"
            </Span>
            <Combobox
              items={countries}
              placeholder='Search a country..'
              noResultsLabel='Nothing matches'
            />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <Combobox items={countries} disabled placeholder='Disabled' />
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
