'use client'

import { Badge } from '@/rn/components/badge'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { Eye } from '@/rn/svg-icons/eye'
import { upperFirst } from '@/shared/lodash'
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
const appearances = ['solid', 'soft'] as const
const sizes = ['sm', 'md', 'lg'] as const
const shapes = ['rounded', 'pill'] as const

export const BadgePage = async () => {
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
              Badge
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              appearance
            </Span>
            {appearances.map(appearance => (
              <View key={appearance} className='gap-2'>
                <Span className='text-foreground italic transition'>
                  {appearance}
                </Span>
                <View className='flex-row flex-wrap gap-3'>
                  {types.map(type => (
                    <Badge key={type} type={type} appearance={appearance}>
                      <Span>{upperFirst(type)}</Span>
                    </Badge>
                  ))}
                </View>
              </View>
            ))}
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='flex-row flex-wrap items-center gap-3'>
              {sizes.map(size => (
                <Badge key={size} size={size}>
                  <Span>{upperFirst(size)} badge</Span>
                </Badge>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              shape
            </Span>
            <View className='flex-row flex-wrap items-center gap-3'>
              {shapes.map(shape => (
                <Badge key={shape} shape={shape}>
                  <Span>{upperFirst(shape)} badge</Span>
                </Badge>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              with icon
            </Span>
            <View className='flex-row flex-wrap gap-3'>
              <Badge>
                <Span>Right icon</Span>
                <Eye />
              </Badge>
              <Badge>
                <Eye />
                <Span>Left icon</Span>
              </Badge>
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
