import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { getLangUntyped } from '@/rn/core/i18n/config'
import { useI18nSwitcherProps } from '@/rn/core/i18n/use-i18n-switcher-props'
import { languages } from '#/i18n/config'

export const I18nSwitcher = async () => {
  const { currentLang, LinkWeb, onPressNative } = await useI18nSwitcherProps()

  return (
    <>
      <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
        LANGUAGE
      </Span>
      {languages.map(l => {
        const lang = getLangUntyped(l.locale)
        const active = currentLang === lang

        const dot = (
          <View
            className={[
              'h-2 w-2 rounded-full transition',
              active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600',
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
            onPress={onPressNative && (() => onPressNative(lang))}
            className='flex-row items-center gap-2.5 rounded-md px-2 py-2'
          >
            {dot}
            {label}
          </Pressable>
        )
      })}
    </>
  )
}
