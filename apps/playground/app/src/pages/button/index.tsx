'use client'

import { Button } from '@/rn/components/button'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'

const types = [
  'basic',
  'primary',
  'secondary',
  'info',
  'success',
  'warning',
  'error',
] as const
const appearances = [
  'solid',
  'soft',
  'outline',
  'ghost',
  'transparent',
] as const
const sizes = ['sm', 'md', 'lg'] as const
const shapes = ['none', 'rounded', 'pill'] as const

export const ButtonPage = async () => {
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
              Button
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              appearance
            </Span>
            <View className='gap-4'>
              {appearances.map(appearance => (
                <View key={appearance} className='gap-2'>
                  <Span className='text-foreground italic transition'>
                    {appearance}
                  </Span>
                  <View className='flex-row flex-wrap gap-3'>
                    {types.map(type => (
                      <Button key={type} type={type} appearance={appearance}>
                        {type}
                      </Button>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              as child
            </Span>
            <View className='gap-4'>
              <Button asChild>
                <a
                  href='https://google.com'
                  target='_blank'
                  className='relative'
                >
                  <Span>Google</Span>
                </a>
              </Button>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='flex-row flex-wrap items-center gap-3'>
              {sizes.map(size => (
                <Button key={size} size={size}>
                  {size}
                </Button>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              shape
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              {shapes.map(shape => (
                <Button key={shape} shape={shape}>
                  {shape}
                </Button>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              elevation
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button elevation={false}>no elevation</Button>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              elevation backdrop
            </Span>
            <Span className='text-foreground italic transition'>
              only available in solid and soft
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button elevationBackdrop={false}>no elevation backdrop</Button>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              inset
            </Span>
            <Span className='text-foreground italic transition'>
              available in all types except link
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button inset={false}>no inset</Button>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              ripple
            </Span>
            <Span className='text-foreground italic transition'>
              only available in solid and soft
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button ripple={false}>no ripple</Button>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button disabled>disabled</Button>
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              loading
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button loading loadingChildren='loading...'>
                none
              </Button>
              <Button loading type='primary'>
                solid
              </Button>
              <Button loading type='secondary' appearance='soft'>
                soft
              </Button>
              <Button loading type='info' appearance='outline'>
                outline
              </Button>
              <Button loading type='success' appearance='ghost'>
                ghost
              </Button>
              <Button loading type='warning'>
                none
              </Button>
            </View>
            <Span className='text-foreground italic transition'>
              loading on press promise
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Button
                loadingChildren='loading...'
                onPress={() => new Promise(r => setTimeout(r, 1000))}
              >
                on press
              </Button>
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
