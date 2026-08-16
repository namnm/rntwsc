'use client'

import { Span } from 'rntwsc/components/text'
import { getLangUntyped } from 'rntwsc/i18n/config'
import { useI18nSwitcherProps } from 'rntwsc/i18n/use-i18n-switcher-props'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { View } from 'rntwsc/tw/components/view'

import { languages } from '@/i18n/config'
import { useTranslation } from '@/i18n'

export type I18nSwitcherProps = {
  onSwitch?: () => void
}

export const I18nSwitcher = async ({ onSwitch }: I18nSwitcherProps) => {
  const t = await useTranslation('common')
  const { currentLang, LinkWeb, onPressNative } = await useI18nSwitcherProps()

  return (
    <View className='gap-1'>
      <Span className='text-foreground mb-1 text-xs font-semibold transition'>
        {t('section_language')}
      </Span>
      {languages.map(l => {
        const lang = getLangUntyped(l.locale)
        const active = currentLang === lang

        const dot = (
          <View
            className={[
              'h-2 w-2 rounded-full transition',
              active
                ? 'bg-primary dark:bg-primary'
                : 'bg-gray-300 dark:bg-gray-600',
            ]}
          />
        )
        const label = (
          <Span
            className={[
              'text-sm transition',
              active
                ? 'font-medium text-gray-900 dark:text-gray-100'
                : 'text-gray-600 dark:text-gray-400',
            ]}
          >
            {l.nativeName}
          </Span>
        )

        if (LinkWeb) {
          return (
            <LinkWeb
              key={lang}
              lang={lang}
              className='flex-row items-center gap-2.5 rounded-md px-2 py-2'
            >
              {dot}
              {label}
            </LinkWeb>
          )
        }

        return (
          <Pressable
            key={lang}
            onPress={
              onPressNative &&
              (() => {
                onPressNative(lang)
                onSwitch?.()
              })
            }
            className='flex-row items-center gap-2.5 rounded-md px-2 py-2'
          >
            {dot}
            {label}
          </Pressable>
        )
      })}
    </View>
  )
}
