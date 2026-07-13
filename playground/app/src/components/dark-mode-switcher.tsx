'use client'

import { Span } from 'rntwsc/components/text'
import { useDarkModeUser, useSetDarkMode } from 'rntwsc/dark-mode'
import { useTranslationUntyped } from 'rntwsc/i18n'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { View } from 'rntwsc/tw/components/view'

export const DarkModeSwitcher = async ({
  onPress,
}: {
  onPress?: () => void
}) => {
  const [t, dark] = await Promise.all([
    useTranslationUntyped('sidebar'),
    useDarkModeUser(),
  ])
  const setDarkMode = useSetDarkMode()

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
    <>
      <Span className='text-foreground mb-1 px-2 text-xs font-semibold transition'>
        {t('section_dark_mode')}
      </Span>
      {options.map(v => {
        const active = v.value === dark
        return (
          <Pressable
            key={`${v.value}`}
            onPress={() => {
              setDarkMode(v.value)
              onPress?.()
            }}
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
    </>
  )
}
