'use client'

import { Portal } from '@rntwsc/core/components/portal'
import { Separator } from '@rntwsc/core/components/separator'
import { Span } from '@rntwsc/core/components/text'
import { useTranslationUntyped } from '@rntwsc/core/i18n'
import { isWeb } from '@rntwsc/core/platform'
import { Pressable } from '@rntwsc/core/tw/components/pressable'
import { ScrollView } from '@rntwsc/core/tw/components/scroll-view'
import { View } from '@rntwsc/core/tw/components/view'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { DarkModeSwitcher } from '#/components/dark-mode-switcher'
import { I18nSwitcher } from '#/components/i18n-switcher'
import { NavSidebarLink } from '#/components/nav-layout/nav-sidebar-link'
import { ThemeSwitcher } from '#/components/theme-switcher'
import {
  rAccordion,
  rAlert,
  rBadge,
  rButton,
  rButtonGroup,
  rButtonToggleGroup,
  rCheckbox,
  rDatePicker,
  rDrawer,
  rFetch,
  rForm,
  rGraphQL,
  rGrid,
  rHome,
  rModal,
  rNativeRefs,
  rRadio,
  rRuntime,
  rSelect,
  rSwitch,
  rTextInput,
  rViewport,
} from '#/pages/route-paths'

type Props = PropsWithChildren<{
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}>

const NavLayoutWithoutEffects = async ({
  children,
  setSidebarOpen,
  sidebarOpen,
}: Props) => {
  const t = await useTranslationUntyped('sidebar')
  const onPress = () => setSidebarOpen(false)

  const sidebar = (
    <View
      className={
        sidebarOpen
          ? 'web:fixed absolute inset-0 z-50 flex flex-col border-r border-gray-200 bg-white transition sm:w-60 dark:border-gray-700 dark:bg-gray-800'
          : 'web:fixed absolute inset-y-0 left-0 z-50 hidden w-60 flex-col border-r border-gray-200 bg-white transition sm:flex dark:border-gray-700 dark:bg-gray-800'
      }
    >
      <View className='flex-row items-center border-b border-gray-200 px-4 py-5 transition dark:border-gray-700'>
        <Pressable
          onPress={() => setSidebarOpen(false)}
          className='mr-3 sm:hidden'
        >
          <Span className='text-primary font-semibold'>{t('back')}</Span>
        </Pressable>
        <Span className='font-semibold text-gray-800 transition dark:text-gray-100'>
          {t('menu')}
        </Span>
      </View>
      <ScrollView className='flex-1 p-1'>
        <NavSidebarLink onPress={onPress} pathname={rHome} label={t('home')} />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          {t('section_display')}
        </Span>
        <NavSidebarLink
          onPress={onPress}
          pathname={rAccordion}
          label={t('accordion')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rBadge}
          label={t('badge')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rAlert}
          label={t('alert')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rButton}
          label={t('button')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rButtonGroup}
          label={t('button_group')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rButtonToggleGroup}
          label={t('button_toggle_group')}
        />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          {t('section_overlay')}
        </Span>
        <NavSidebarLink
          onPress={onPress}
          pathname={rDrawer}
          label={t('drawer')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rModal}
          label={t('modal')}
        />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          {t('section_form')}
        </Span>
        <NavSidebarLink
          onPress={onPress}
          pathname={rTextInput}
          label={t('text_input')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rSelect}
          label={t('select')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rDatePicker}
          label={t('date_picker')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rRadio}
          label={t('radio')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rCheckbox}
          label={t('checkbox')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rSwitch}
          label={t('switch')}
        />
        <NavSidebarLink onPress={onPress} pathname={rForm} label={t('form')} />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          {t('section_others')}
        </Span>
        <NavSidebarLink onPress={onPress} pathname={rGrid} label={t('grid')} />
        <NavSidebarLink
          onPress={onPress}
          pathname={rNativeRefs}
          label={t('native_refs')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rRuntime}
          label={t('runtime_style')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rViewport}
          label={t('viewport')}
        />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          {t('section_hydration')}
        </Span>
        <NavSidebarLink
          onPress={onPress}
          pathname={rFetch}
          label={t('fetch')}
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rGraphQL}
          label={t('graphql')}
        />
        <Separator />
        <ThemeSwitcher onPress={onPress} />
        <Separator />
        <DarkModeSwitcher onPress={onPress} />
        <Separator />
        <I18nSwitcher onPress={onPress} />
      </ScrollView>
    </View>
  )

  return (
    <View className='relative flex-1 sm:flex-row'>
      {/* Native Modal blocks touches even when transparent; only mount when open */}
      {isWeb ? sidebar : sidebarOpen && <Portal>{sidebar}</Portal>}

      <View className='flex-1 flex-col sm:ml-60'>
        <View className='flex-1'>{children}</View>
        <View className='web:sticky web:bottom-0 flex-row border-t border-gray-200 bg-white transition sm:hidden dark:border-gray-700 dark:bg-gray-800'>
          <Pressable
            onPress={() => setSidebarOpen(true)}
            className='flex-1 items-center gap-1 py-3'
          >
            <Span className='text-primary text-xs font-medium transition'>
              {t('open_menu')}
            </Span>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

type NavLayoutProps = PropsWithChildren

export const NavLayout = ({ children }: NavLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const props = {
    children,
    sidebarOpen,
    setSidebarOpen,
  }
  return <NavLayoutWithoutEffects {...props} />
}
