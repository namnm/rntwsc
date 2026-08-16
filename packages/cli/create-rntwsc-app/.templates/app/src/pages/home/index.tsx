import { Button } from 'rntwsc/components/button'
import { H1, Span } from 'rntwsc/components/text'
import { useTranslationUntyped } from 'rntwsc/i18n'
import { isWeb } from 'rntwsc/platform'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { SettingsButton } from '@/components/settings-button'

export const HomePage = async () => {
  const t = await useTranslationUntyped('common')
  const padding = useSafeAreaPadding()
  const Container = isWeb ? View : ScrollView

  return (
    <Container
      className='bg-primary-50 flex-1 transition dark:bg-gray-700'
      contentContainerClassName={padding}
    >
      <View className='flex-row justify-end px-4 py-3'>
        <SettingsButton />
      </View>
      <View className='bg-primary-100 dark:bg-primary-950 flex-1 items-center justify-center px-6 py-16 transition'>
        <H1 className='text-foreground text-center text-4xl font-bold transition md:text-5xl lg:text-6xl'>
          {t('tagline')}
        </H1>
        <Span className='text-foreground mt-5 text-center text-base transition md:text-lg'>
          {t('hero_description')}
        </Span>
        <View className='mt-8 flex-row flex-wrap items-center justify-center gap-3'>
          <Button className='w-40' type='info'>
            {t('get_started')}
          </Button>
          <Button className='w-40' appearance='soft' type='secondary'>
            {t('view_github')}
          </Button>
        </View>
      </View>
    </Container>
  )
}
