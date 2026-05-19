'use client'

import { useCallback, useState } from 'react'

import type { SelectItem } from '@/rn/components/select'
import { Select } from '@/rn/components/select'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { upperFirst } from '@/shared/lodash'
import { NavLayout } from '#/components/nav-layout'

const appearances = ['outlined', 'filled', 'ghost', 'underlined'] as const
const sizes = ['sm', 'md', 'lg'] as const
const shapes = ['rounded', 'pill', 'none'] as const

const fruits: SelectItem[] = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'durian', label: 'Durian' },
  { value: 'elderberry', label: 'Elderberry' },
  { value: 'fig', label: 'Fig' },
  { value: 'grape', label: 'Grape' },
]

const fetchFruits = () =>
  new Promise<SelectItem[]>(resolve => setTimeout(() => resolve(fruits), 1200))

export const SelectPage = () => {
  const padding = useSafeAreaPadding()
  const [controlled, setControlled] = useState('banana')
  const [multi, setMulti] = useState<string[]>(['banana', 'cherry'])
  const [remoteItems, setRemoteItems] = useState<SelectItem[]>(fruits)

  const handleRemoteSearch = useCallback((query: string) => {
    const lower = query.toLowerCase()
    setRemoteItems(
      fruits
        .filter(f => f.label.toLowerCase().includes(lower))
        .map(f => {
          const idx = f.label.toLowerCase().indexOf(lower)
          return {
            ...f,
            highlight: query.length > 0
              ? [[idx, idx + query.length] as [number, number]]
              : undefined,
          }
        }),
    )
  }, [])

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <View className='flex-row items-center gap-3'>
            <H1 className='text-foreground text-2xl font-semibold transition'>
              Select
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
                  <Select
                    appearance={appearance}
                    items={fruits}
                    title={upperFirst(appearance)}
                    placeholder='Select a fruit..'
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
                  <Select
                    size={size}
                    items={fruits}
                    title={upperFirst(size)}
                    placeholder='Select a fruit..'
                  />
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
                  <Select
                    shape={shape}
                    items={fruits}
                    title={upperFirst(shape)}
                    placeholder='Select a fruit..'
                  />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              controlled
            </Span>
            <Select
              items={fruits}
              title='Pick a fruit'
              value={controlled}
              onChange={setControlled}
            />
            <Span className='text-foreground text-xs transition'>
              Selected: {controlled || '-'}
            </Span>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              multiple
            </Span>
            <Select
              multiple
              items={fruits}
              title='Pick fruits'
              value={multi}
              onChange={setMulti}
            />
            <Span className='text-foreground text-xs transition'>
              Selected: {multi.length ? multi.join(', ') : '-'}
            </Span>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              search (local filter)
            </Span>
            <Select
              items={fruits}
              searchable
              title='Search fruits'
              placeholder='Select a fruit..'
            />
            <Select
              multiple
              items={fruits}
              searchable
              title='Search fruits (multiple)'
              placeholder='Select fruits..'
            />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              search (remote + highlight)
            </Span>
            <Span className='text-foreground text-xs transition'>
              onSearch updates items from outside, server returns highlight ranges
            </Span>
            <Select
              items={remoteItems}
              onSearch={handleRemoteSearch}
              title='Search fruits'
              placeholder='Select a fruit..'
            />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              items as async function
            </Span>
            <Span className='text-foreground text-xs transition'>
              fetches on open, shows loading state while promise resolves
            </Span>
            <Select
              items={fetchFruits}
              title='Async fruits'
              placeholder='Select a fruit..'
            />
            <Select
              multiple
              items={fetchFruits}
              searchable
              title='Async + search + multiple'
              placeholder='Select fruits..'
            />
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <Select items={fruits} defaultValue='apple' disabled />
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
