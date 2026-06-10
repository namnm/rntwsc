'use client'

import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { useSetTheme, useTheme } from '@/rn/core/theme'
import { getAvailableThemes } from '@/rn/core/theme/config'
import { capitalCase } from '@/shared/lodash'

export const ThemeSwitcher = async () => {
  const themes = getAvailableThemes()
  const theme = await useTheme()
  const setTheme = useSetTheme()

  return (
    <>
      <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
        THEME
      </Span>
      {themes.map(v => {
        const active = v.name === theme
        return (
          <Pressable
            key={v.name}
            onPress={() => setTheme(v.name)}
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
              {capitalCase(v.name)}
            </Span>
          </Pressable>
        )
      })}
    </>
  )
}
