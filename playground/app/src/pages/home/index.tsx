import { Button } from 'rntwsc/components/button'
import { H1, H2, H3, Span } from 'rntwsc/components/text'
import { useTranslationUntyped } from 'rntwsc/i18n'
import { isWeb } from 'rntwsc/platform'
import { useSafeAreaPadding } from 'rntwsc/responsive/use-safe-area'
import { ScrollView } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

import { NavLayout } from '@/components/nav-layout'

export const HomePage = async () => {
  const t = await useTranslationUntyped('home')
  const padding = useSafeAreaPadding()
  const Container = isWeb ? View : ScrollView

  const features = [
    {
      title: t('feat_platform_title'),
      desc: t('feat_platform_desc'),
    },
    {
      title: t('feat_rsc_title'),
      desc: t('feat_rsc_desc'),
    },
    {
      title: t('feat_nav_title'),
      desc: t('feat_nav_desc'),
    },
    {
      title: t('feat_i18n_title'),
      desc: t('feat_i18n_desc'),
    },
    {
      title: t('feat_tailwind_title'),
      desc: t('feat_tailwind_desc'),
    },
    {
      title: t('feat_theme_title'),
      desc: t('feat_theme_desc'),
    },
    {
      title: t('feat_builtin_title'),
      desc: t('feat_builtin_desc'),
    },
    {
      title: t('feat_fetch_title'),
      desc: t('feat_fetch_desc'),
    },
    {
      title: t('feat_devtools_title'),
      desc: t('feat_devtools_desc'),
    },
  ]

  return (
    <NavLayout>
      <Container
        className='bg-primary-50 flex-1 transition dark:bg-gray-700'
        contentContainerClassName={padding}
      >
        {/* Hero */}
        <View className='bg-primary-100 dark:bg-primary-950 px-6 py-16 transition'>
          <H1 className='text-foreground text-center text-4xl font-bold transition md:text-5xl lg:text-6xl'>
            rntwsc
          </H1>
          <Span className='text-primary mt-3 text-center text-sm font-semibold uppercase transition'>
            {t('tagline')}
          </Span>
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

        {/* Features */}
        <View className='px-6 py-14'>
          <H2 className='text-foreground mb-10 text-center transition'>
            {t('features_title')}
          </H2>
          <View className='gap-4 md:flex-row md:flex-wrap md:justify-center'>
            {features.map(({ title, desc }) => (
              <View
                key={title}
                className='rounded-2xl bg-white p-6 transition md:w-72 dark:bg-gray-800'
              >
                <H3 className='text-primary mb-2 text-lg transition'>
                  {title}
                </H3>
                <Span className='text-foreground text-sm transition'>
                  {desc}
                </Span>
              </View>
            ))}
          </View>
        </View>
        {/* Why */}
        <View className='bg-primary-100 dark:bg-primary-950 px-6 py-14 transition'>
          <H2 className='text-foreground mb-10 text-center transition'>
            {t('why_title')}
          </H2>
          <View className='gap-6 md:flex-row md:flex-wrap md:justify-center'>
            {[
              {
                title: t('why_style_title'),
                problem: t('why_style_problem'),
                solution: t('why_style_solution'),
              },
              {
                title: t('why_hydration_title'),
                problem: t('why_hydration_problem'),
                solution: t('why_hydration_solution'),
              },
              {
                title: t('why_reuse_title'),
                problem: t('why_reuse_problem'),
                solution: t('why_reuse_solution'),
              },
            ].map(({ title, problem, solution }) => (
              <View
                key={title}
                className='rounded-2xl bg-white p-6 transition md:w-80 dark:bg-gray-800'
              >
                <H3 className='text-primary mb-3 text-lg transition'>
                  {title}
                </H3>
                <Span className='mb-3 text-sm text-gray-500 transition dark:text-gray-400'>
                  {problem}
                </Span>
                <Span className='text-foreground text-sm font-medium transition'>
                  {solution}
                </Span>
              </View>
            ))}
          </View>
        </View>
      </Container>
    </NavLayout>
  )
}
