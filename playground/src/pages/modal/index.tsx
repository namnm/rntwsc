'use client'

import { useState } from 'react'

import { Button } from '@/rn/components/button'
import type { ModalProps } from '@/rn/components/modal'
import { Modal } from '@/rn/components/modal'
import { Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'

const sizes = ['sm', 'md', 'lg', 'full'] as const

export const ModalPage = () => {
  const padding = useSafeAreaPadding()
  const [open, setOpen] = useState<ModalProps['size'] | null>(null)

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <Span className='text-foreground text-2xl font-semibold transition'>
            Modal
          </Span>

          <View className='gap-4'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='flex-row flex-wrap gap-2'>
              {sizes.map(size => (
                <Button
                  key={size}
                  type='primary'
                  appearance='soft'
                  onPress={() => setOpen(size)}
                >
                  {size}
                </Button>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {sizes.map(size => (
        <Modal
          key={size}
          size={size}
          value={open === size}
          onChange={v => !v && setOpen(null)}
        >
          <View className='gap-4 px-4 py-6'>
            <Span className='text-foreground text-lg font-semibold transition'>
              {size} modal
            </Span>
            <Span className='text-gray-500 dark:text-gray-400'>
              Tap the backdrop or press close to dismiss.
            </Span>
            <Button onPress={() => setOpen(null)}>Close</Button>
          </View>
        </Modal>
      ))}
    </NavLayout>
  )
}
