'use client'

import { Tabs } from 'rntwsc/components/tabs'
import { H1, Span } from 'rntwsc/components/text'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

const sizes = ['sm', 'md', 'lg'] as const

export const TabsPage = () => {
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
              Tabs
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              basic
            </Span>
            <Tabs defaultValue='profile'>
              <Tabs.List>
                <Tabs.Trigger value='profile'>
                  <Span>Profile</Span>
                </Tabs.Trigger>
                <Tabs.Trigger value='settings'>
                  <Span>Settings</Span>
                </Tabs.Trigger>
                <Tabs.Trigger value='billing' disabled>
                  <Span>Billing</Span>
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content value='profile' className='py-4'>
                <Span className='text-foreground transition'>
                  Profile content
                </Span>
              </Tabs.Content>
              <Tabs.Content value='settings' className='py-4'>
                <Span className='text-foreground transition'>
                  Settings content
                </Span>
              </Tabs.Content>
              <Tabs.Content value='billing' className='py-4'>
                <Span className='text-foreground transition'>
                  Billing content
                </Span>
              </Tabs.Content>
            </Tabs>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='gap-4'>
              {sizes.map(size => (
                <Tabs key={size} size={size} defaultValue='one'>
                  <Tabs.List>
                    <Tabs.Trigger value='one'>
                      <Span>One</Span>
                    </Tabs.Trigger>
                    <Tabs.Trigger value='two'>
                      <Span>Two</Span>
                    </Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value='one' className='py-3'>
                    <Span className='text-foreground text-xs transition'>
                      {size} - one
                    </Span>
                  </Tabs.Content>
                  <Tabs.Content value='two' className='py-3'>
                    <Span className='text-foreground text-xs transition'>
                      {size} - two
                    </Span>
                  </Tabs.Content>
                </Tabs>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
