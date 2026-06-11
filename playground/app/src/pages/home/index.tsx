import { Button } from '@/rn/components/button'
import { H1, Span } from '@/rn/components/text'
import { ScrollView } from '@/rn/core/components/scroll-view'
import { View } from '@/rn/core/components/view'
import { useTranslationUntyped } from '@/rn/core/i18n'
import { useSafeAreaPadding } from '@/rn/core/responsive/use-safe-area'
import { isWeb } from '@/rn/core/utils/platform'
import { NavLayout } from '#/components/nav-layout'

export const HomePage = async () => {
  const t = await useTranslationUntyped('home')
  const padding = useSafeAreaPadding()
  const Container = isWeb ? View : ScrollView

  return (
    <NavLayout>
      <Container
        className='bg-primary-50 flex-1 transition dark:bg-gray-700'
        contentContainerClassName={padding}
      >
        <View className='bg-primary-100 dark:bg-primary-950 px-3 py-10 transition'>
          <H1 className='text-foreground text-center text-3xl font-medium transition md:text-4xl lg:text-5xl'>
            React Native - Tailwind - NextJS
          </H1>
          <Span className='text-foreground mt-5 text-center transition'>
            {t('description')}
          </Span>
          <View className='mt-5 items-center'>
            <Button className='w-40'>CVA Button</Button>
          </View>
        </View>
      </Container>
    </NavLayout>
  )
}
