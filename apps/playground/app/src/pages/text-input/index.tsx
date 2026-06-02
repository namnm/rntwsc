import { TextInput } from '@/rn/components/input'
import { PasswordInput } from '@/rn/components/input/password-input'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { NavLayout } from '#/components/nav-layout'

const appearances = ['outlined', 'filled', 'ghost', 'underlined'] as const
const sizes = ['sm', 'md', 'lg'] as const
const shapes = ['none', 'rounded', 'pill'] as const

export const TextInputPage = () => {
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
              Text Input
            </H1>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              appearance
            </Span>
            <View className='gap-2'>
              {appearances.map(appearance => (
                <View key={appearance} className='gap-1'>
                  <Span className='text-foreground italic transition'>
                    {appearance}
                  </Span>
                  <TextInput
                    appearance={appearance}
                    shape={appearance === 'underlined' ? 'none' : 'rounded'}
                    placeholder={appearance}
                  />
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              size
            </Span>
            <View className='gap-2'>
              {sizes.map(size => (
                <TextInput key={size} size={size} placeholder={size} />
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              shape
            </Span>
            <View className='gap-2'>
              {shapes.map(shape => (
                <TextInput key={shape} shape={shape} placeholder={shape} />
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              invalid
            </Span>
            <View className='gap-2'>
              <TextInput placeholder='normal' />
              <TextInput invalid placeholder='invalid' />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              appearance x invalid
            </Span>
            <View className='gap-3'>
              {appearances.map(appearance => (
                <View key={appearance} className='gap-1'>
                  <Span className='text-foreground italic transition'>
                    {appearance}
                  </Span>
                  <View className='gap-2'>
                    <TextInput
                      appearance={appearance}
                      shape={appearance === 'underlined' ? 'none' : 'rounded'}
                      placeholder='normal'
                    />
                    <TextInput
                      appearance={appearance}
                      shape={appearance === 'underlined' ? 'none' : 'rounded'}
                      invalid
                      placeholder='invalid'
                    />
                  </View>
                </View>
              ))}
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              prefix
            </Span>
            <View className='gap-2'>
              <TextInput placeholder='amount' prefix={<Span>$</Span>} />
              <TextInput placeholder='username' prefix={<Span>@</Span>} />
              <TextInput placeholder='search' prefix={<Span>🔍</Span>} />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              suffix
            </Span>
            <View className='gap-2'>
              <TextInput placeholder='website' suffix={<Span>.com</Span>} />
              <TextInput placeholder='weight' suffix={<Span>kg</Span>} />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              prefix + suffix
            </Span>
            <View className='gap-2'>
              <TextInput
                placeholder='price'
                prefix={<Span>$</Span>}
                suffix={<Span>USD</Span>}
              />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              disabled
            </Span>
            <View className='gap-2'>
              <TextInput
                placeholder='disabled input'
                disabled
                className='opacity-50'
              />
              <TextInput
                value='read only value'
                editable={false}
                className='opacity-50'
              />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              password
            </Span>
            <View className='gap-2'>
              <PasswordInput placeholder='password input' />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              keyboard type
            </Span>
            <View className='gap-2'>
              <TextInput
                placeholder='email address'
                keyboardType='email-address'
                autoCapitalize='none'
              />
              <TextInput placeholder='numeric' keyboardType='numeric' />
              <TextInput placeholder='phone number' keyboardType='phone-pad' />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              multiline
            </Span>
            <View className='gap-2'>
              <TextInput
                placeholder='write something...'
                multiline
                numberOfLines={4}
                className='h-24 py-2'
              />
            </View>
          </View>

          <View className='gap-3'>
            <Span className='text-foreground text-lg font-semibold transition'>
              max length
            </Span>
            <View className='gap-2'>
              <TextInput
                placeholder='max 10 characters'
                maxLength={10}
                suffix={<Span>10</Span>}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </NavLayout>
  )
}
