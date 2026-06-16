'use client'

import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { Portal } from '@/core/components/portal'
import { Separator } from '@/core/components/separator'
import { Span } from '@/core/components/text'
import { useRoute } from '@/core/navigation'
import { isWeb } from '@/core/platform'
import { Pressable } from '@/core/tw/components/pressable'
import { ScrollView } from '@/core/tw/components/scroll-view'
import { View } from '@/core/tw/components/view'
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

const NavLayoutWithEffects = ({
  children,
  setSidebarOpen,
  sidebarOpen,
  pathname,
}: any) => {
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
          <Span className='text-primary font-semibold'>{'<- Back'}</Span>
        </Pressable>
        <Span className='font-semibold text-gray-800 transition dark:text-gray-100'>
          Menu
        </Span>
      </View>
      <ScrollView className='flex-1 p-1'>
        <NavSidebarLink onPress={onPress} pathname={rHome} label='Home' />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          DISPLAY
        </Span>
        <NavSidebarLink
          onPress={onPress}
          pathname={rAccordion}
          label='Accordion'
        />
        <NavSidebarLink onPress={onPress} pathname={rBadge} label='Badge' />
        <NavSidebarLink onPress={onPress} pathname={rAlert} label='Alert' />
        <NavSidebarLink onPress={onPress} pathname={rButton} label='Button' />
        <NavSidebarLink
          onPress={onPress}
          pathname={rButtonGroup}
          label='Button Group'
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rButtonToggleGroup}
          label='Button Toggle Group'
        />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          OVERLAY
        </Span>
        <NavSidebarLink onPress={onPress} pathname={rDrawer} label='Drawer' />
        <NavSidebarLink onPress={onPress} pathname={rModal} label='Modal' />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          FORM
        </Span>
        <NavSidebarLink
          onPress={onPress}
          pathname={rTextInput}
          label='Text Input'
        />
        <NavSidebarLink onPress={onPress} pathname={rSelect} label='Select' />
        <NavSidebarLink
          onPress={onPress}
          pathname={rDatePicker}
          label='Date Picker'
        />
        <NavSidebarLink onPress={onPress} pathname={rRadio} label='Radio' />
        <NavSidebarLink
          onPress={onPress}
          pathname={rCheckbox}
          label='Checkbox'
        />
        <NavSidebarLink onPress={onPress} pathname={rSwitch} label='Switch' />
        <NavSidebarLink onPress={onPress} pathname={rForm} label='Form' />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          OTHERS
        </Span>
        <NavSidebarLink onPress={onPress} pathname={rGrid} label='Grid' />
        <NavSidebarLink
          onPress={onPress}
          pathname={rNativeRefs}
          label='Native Refs'
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rRuntime}
          label='Runtime Style'
        />
        <NavSidebarLink
          onPress={onPress}
          pathname={rViewport}
          label='Viewport'
        />
        <NavSidebarLink onPress={onPress} pathname={rFetch} label='Fetch' />
        <NavSidebarLink onPress={onPress} pathname={rGraphQL} label='GraphQL' />
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
              Open Menu
            </Span>
          </Pressable>
        </View>
      </View>
    </View>
  )
}

type NavLayoutProps = PropsWithChildren

export const NavLayout = async ({ children }: NavLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = await useRoute()
  const props = {
    children,
    sidebarOpen,
    setSidebarOpen,
    pathname,
  }
  return <NavLayoutWithEffects {...props} />
}
