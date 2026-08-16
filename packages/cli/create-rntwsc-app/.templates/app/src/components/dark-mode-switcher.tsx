'use client'

import { Span } from 'rntwsc/components/text'
import { useDarkModeUser, useSetDarkMode } from 'rntwsc/dark-mode'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { View } from 'rntwsc/tw/components/view'

import { useTranslation } from '@/i18n'

export const DarkModeSwitcher = async () => {
  const t = await useTranslation('common')
  const dark = await useDarkModeUser()
  const setDarkMode = await useSetDarkMode()

  const options = [
    {
      value: true,
      name: t('dark'),
    },
    {
      value: false,
      name: t('light'),
    },
    {
      value: undefined,
      name: t('system'),
    },
  ]

  return (
    <View className='gap-1'>
      <Span className='text-foreground mb-1 text-xs font-semibold transition'>
        {t('section_dark_mode')}
      </Span>
      {options.map(v => {
        const active = v.value === dark
        return (
          <Pressable
            key={`${v.value}`}
            onPress={() => setDarkMode(v.value)}
            className='flex-row items-center gap-2.5 rounded-md px-2 py-2'
          >
            <View
              className={[
                'h-2 w-2 rounded-full transition',
                active ? 'bg-primary' : 'bg-muted',
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
              {v.name}
            </Span>
          </Pressable>
        )
      })}
    </View>
  )
}
