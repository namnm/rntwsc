'use client'

import { Span } from '@/core/components/text'
import { useTranslationUntyped } from '@/core/i18n'
import { useSetTheme, useTheme } from '@/core/theme'
import { getAvailableThemes } from '@/core/theme/config'
import { Pressable } from '@/core/tw/components/pressable'
import { View } from '@/core/tw/components/view'

export const ThemeSwitcher = async ({ onPress }: { onPress?: () => void }) => {
  const [t, tThemes] = await Promise.all([
    useTranslationUntyped('sidebar'),
    useTranslationUntyped('themes'),
  ])
  const themes = getAvailableThemes()
  const theme = await useTheme()
  const setTheme = useSetTheme()

  return (
    <>
      <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
        {t('section_theme')}
      </Span>
      {themes.map(v => {
        const active = v.name === theme
        return (
          <Pressable
            key={v.name}
            onPress={() => {
              setTheme(v.name)
              onPress?.()
            }}
            className='flex-row items-center gap-2.5 rounded-md px-2 py-2'
          >
            <View
              className={[
                'h-2 w-2 rounded-full transition',
                active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600',
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
              {tThemes(v.name)}
            </Span>
          </Pressable>
        )
      })}
    </>
  )
}
