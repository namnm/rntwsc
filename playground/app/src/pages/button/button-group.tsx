import { Button } from '@/rn/components/button'
import { ButtonGroup } from '@/rn/components/button-group'
import { Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'

const appearances = ['solid', 'soft', 'outline', 'ghost'] as const
const shapes = ['none', 'rounded', 'pill'] as const
const sizes = ['sm', 'md', 'lg'] as const

export const ButtonGroupPage = () => {
  const padding = useSafeAreaPadding()

  return (
    <NavLayout>
      <ScrollView
        className='flex-1 bg-white transition dark:bg-gray-900'
        contentContainerClassName={padding}
      >
        <View className='gap-8 px-4 py-6'>
          <Span className='text-foreground text-2xl font-semibold transition'>
            Button Group
          </Span>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              appearance
            </Span>
            <View className='gap-3'>
              {appearances.map(appearance => (
                <View key={appearance} className='gap-2'>
                  <Span className='text-foreground italic transition'>
                    {appearance}
                  </Span>
                  <ButtonGroup appearance={appearance}>
                    <Button>One</Button>
                    <Button>Two</Button>
                    <Button>Three</Button>
                  </ButtonGroup>
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
                <View key={size} className='gap-2'>
                  <Span className='text-foreground italic transition'>
                    {size}
                  </Span>
                  <ButtonGroup size={size}>
                    <Button>One</Button>
                    <Button>Two</Button>
                    <Button>Three</Button>
                  </ButtonGroup>
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
                <View key={shape} className='gap-2'>
                  <Span className='text-foreground italic transition'>
                    {shape}
                  </Span>
                  <ButtonGroup shape={shape}>
                    <Button>One</Button>
                    <Button>Two</Button>
                    <Button>Three</Button>
                  </ButtonGroup>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              mixed type
            </Span>
            {appearances.map(appearance => (
              <View key={appearance} className='gap-2'>
                <ButtonGroup appearance={appearance}>
                  <Button type='success'>One</Button>
                  <Button type='error'>Two</Button>
                  <Button type='warning'>Three</Button>
                </ButtonGroup>
              </View>
            ))}
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            {appearances.map(appearance => (
              <View key={appearance} className='gap-2'>
                <ButtonGroup appearance={appearance}>
                  <Button>One</Button>
                  <Button disabled>Two</Button>
                  <Button>Three</Button>
                </ButtonGroup>
              </View>
            ))}
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled (root)
            </Span>
            {appearances.map(appearance => (
              <View key={appearance} className='gap-2'>
                <ButtonGroup appearance={appearance} disabled>
                  <Button>One</Button>
                  <Button>Two</Button>
                  <Button>Three</Button>
                </ButtonGroup>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
