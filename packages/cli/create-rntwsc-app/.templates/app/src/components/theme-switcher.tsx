'use client'

import { Span } from 'rntwsc/components/text'
import { useSetTheme, useTheme } from 'rntwsc/theme'
import { getAvailableThemes } from 'rntwsc/theme/config'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { View } from 'rntwsc/tw/components/view'

import { useTranslation } from '@/i18n'

// theme names (ruby, ocean, ...) are proper names from the 10 builtin
// themes in rntwsc/themes/all, so we just capitalize them instead of
// translating each one per locale
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export const ThemeSwitcher = async () => {
  const t = await useTranslation('common')
  const theme = await useTheme()
  const setTheme = useSetTheme()

  const themes = getAvailableThemes()

  return (
    <View className='gap-1'>
      <Span className='text-foreground mb-1 text-xs font-semibold transition'>
        {t('section_theme')}
      </Span>
      <View className='flex-row flex-wrap gap-2'>
        {themes.map(v => {
          const active = v.name === theme
          return (
            <Pressable
              key={v.name}
              onPress={() => setTheme(v.name)}
              className={[
                'flex-row items-center gap-2 rounded-full border px-3 py-1.5 transition',
                active
                  ? 'border-primary bg-primary/10'
                  : 'border-gray-200 dark:border-gray-700',
              ]}
            >
              <View
                className={[
                  'h-2 w-2 rounded-full transition',
                  active
                    ? 'bg-primary dark:bg-primary'
                    : 'bg-gray-300 dark:bg-gray-600',
                ]}
              />
              <Span
                className={[
                  'text-sm transition',
                  active
                    ? 'font-medium text-gray-900 dark:text-gray-100'
                    : 'text-gray-600 dark:text-gray-400',
                ]}
              >
                {capitalize(v.name)}
              </Span>
            </Pressable>
          )
        })}
      </View>
    </View>
  )
}
