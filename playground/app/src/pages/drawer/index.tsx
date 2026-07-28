'use client'

import { useState } from 'react'
import { Button } from 'rntwsc/components/button'
import { Drawer } from 'rntwsc/components/drawer'
import { Span } from 'rntwsc/components/text'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

const sides = ['bottom', 'left', 'right'] as const

export const DrawerPage = () => {
  const padding = useSafeAreaPadding()
  const [open, setOpen] = useState<(typeof sides)[number] | null>(null)

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <Span className='text-foreground text-2xl font-semibold transition'>
            Drawer
          </Span>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              side
            </Span>
            <View className='flex-row flex-wrap gap-2'>
              {sides.map(side => (
                <Button
                  key={side}
                  type='primary'
                  appearance='soft'
                  onPress={() => setOpen(side)}
                >
                  {side}
                </Button>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {sides.map(side => (
        <Drawer
          key={side}
          side={side}
          open={open === side}
          onClose={() => setOpen(null)}
        >
          <View className='gap-4 px-4 pt-2 pb-8'>
            <Span className='text-foreground text-lg font-semibold transition'>
              {side} drawer
            </Span>
            <Span className='text-gray-500 dark:text-gray-400'>
              Tap the backdrop or press close to dismiss.
            </Span>
            <Button onPress={() => setOpen(null)}>Close</Button>
          </View>
        </Drawer>
      ))}
    </NavLayout>
  )
}
