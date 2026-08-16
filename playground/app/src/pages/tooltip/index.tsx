'use client'

import { Button } from 'rntwsc/components/button'
import { H1, Span } from 'rntwsc/components/text'
import { Tooltip } from 'rntwsc/components/tooltip'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

const placements = ['top', 'bottom', 'left', 'right'] as const

export const TooltipPage = () => {
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
              Tooltip
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              placement
            </Span>
            <Span className='text-foreground text-xs transition'>
              hover or focus a button - long press on native
            </Span>
            <View className='flex-row flex-wrap gap-4'>
              {placements.map(placement => (
                <Tooltip
                  key={placement}
                  content={`Placement: ${placement}`}
                  placement={placement}
                >
                  <Button appearance='outline'>
                    <Span>{placement}</Span>
                  </Button>
                </Tooltip>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
