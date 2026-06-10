'use client'

import { Alert } from '@/rn/components/alert'
import { H1, Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { Plus } from '@/rn/svg-icons/plus'
import { NavLayout } from '#/components/nav-layout'

const types = [
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const

export const AlertPage = async () => {
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
              Alert
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              type
            </Span>
            <View className='gap-3'>
              {types.map(type => (
                <Alert key={type} type={type}>
                  <Alert.Title>{type}</Alert.Title>
                  <Alert.Description>
                    This is an alert with type {type}.
                  </Alert.Description>
                </Alert>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              with icon
            </Span>
            <View className='gap-3'>
              <Alert>
                <Alert.Icon>
                  <Plus />
                </Alert.Icon>
                <Alert.Title>with icon</Alert.Title>
                <Alert.Description>
                  This is an alert with icon.
                </Alert.Description>
              </Alert>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              with action
            </Span>
            <View className='gap-3'>
              <Alert>
                <Alert.Title>with action</Alert.Title>
                <Alert.Description>
                  This is an alert with action.
                </Alert.Description>
                <Alert.Action>
                  <Pressable>
                    <Span className='text-sm font-medium underline'>
                      Dismiss
                    </Span>
                  </Pressable>
                </Alert.Action>
              </Alert>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              misc
            </Span>

            <View className='gap-3'>
              <Alert>
                <Alert.Icon>
                  <Plus />
                </Alert.Icon>
                <Alert.Title>with icon and action</Alert.Title>
                <Alert.Description>
                  This is an alert with icon and action.
                </Alert.Description>
                <Alert.Action>
                  <Pressable>
                    <Span className='text-sm font-medium underline'>
                      Dismiss
                    </Span>
                  </Pressable>
                </Alert.Action>
              </Alert>
            </View>

            <View className='gap-3'>
              <Alert>
                <Alert.Title>title only</Alert.Title>
              </Alert>
            </View>

            <View className='gap-3'>
              <Alert>
                <Alert.Description>description only</Alert.Description>
              </Alert>
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
