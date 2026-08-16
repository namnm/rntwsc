'use client'

import { Button } from 'rntwsc/components/button'
import { H1, Span } from 'rntwsc/components/text'
import { Toast, toast } from 'rntwsc/components/toast'
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

export const ToastPage = () => {
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
              Toast
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              type
            </Span>
            <Span className='text-foreground text-xs transition'>
              tap a button to trigger a toast, tap the toast to dismiss it early
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              {types.map(type => (
                <Button
                  key={type}
                  appearance='outline'
                  onPress={() =>
                    toast({
                      type,
                      message: `A ${type} toast message`,
                    })
                  }
                >
                  <Span>{type}</Span>
                </Button>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      <Toast />
    </NavLayout>
  )
}
