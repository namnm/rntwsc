'use client'

import type { PropsWithChildren } from 'react'
import { useEffect, useState } from 'react'

import { Separator } from '@/rn/components/separator'
import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { useRoute } from '@/rn/core/navigation'
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
  rForm,
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
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  return (
    <View className='relative flex-1 sm:flex-row'>
      <View
        className={
          sidebarOpen
            ? 'absolute inset-0 z-50 flex flex-col border-r border-gray-200 bg-white transition sm:relative sm:w-60 dark:border-gray-700 dark:bg-gray-800'
            : 'hidden flex-col border-r border-gray-200 bg-white transition sm:flex sm:w-60 dark:border-gray-700 dark:bg-gray-800'
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
            Menu {pathname}
          </Span>
        </View>
        <View className='flex-1 p-1'>
          <NavSidebarLink href={rHome} label='Home' />
          <Separator />
          <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
            DISPLAY
          </Span>
          <NavSidebarLink href={rAccordion} label='Accordion' />
          <NavSidebarLink href={rBadge} label='Badge' />
          <NavSidebarLink href={rAlert} label='Alert' />
          <NavSidebarLink href={rButton} label='Button' />
          <NavSidebarLink href={rButtonGroup} label='Button Group' />
          <NavSidebarLink
            href={rButtonToggleGroup}
            label='Button Toggle Group'
          />
          <Separator />
          <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
            OVERLAY
          </Span>
          <NavSidebarLink href={rDrawer} label='Drawer' />
          <NavSidebarLink href={rModal} label='Modal' />
          <Separator />
          <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
            FORM
          </Span>
          <NavSidebarLink href={rTextInput} label='Text Input' />
          <NavSidebarLink href={rSelect} label='Select' />
          <NavSidebarLink href={rDatePicker} label='Date Picker' />
          <NavSidebarLink href={rRadio} label='Radio' />
          <NavSidebarLink href={rCheckbox} label='Checkbox' />
          <NavSidebarLink href={rSwitch} label='Switch' />
          <NavSidebarLink href={rForm} label='Form' />
          <Separator />
          <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
            OTHERS
          </Span>
          <NavSidebarLink href={rGrid} label='Grid' />
          <NavSidebarLink href={rNativeRefs} label='Native Refs' />
          <NavSidebarLink href={rRuntime} label='Runtime Style' />
          <NavSidebarLink href={rViewport} label='Viewport' />
          <Separator />
          <ThemeSwitcher />
          <Separator />
          <DarkModeSwitcher />
          <Separator />
          <I18nSwitcher />
        </View>
      </View>

      <View className='flex-1 flex-col'>
        <View className='flex-1'>{children}</View>
        <View className='flex-row border-t border-gray-200 bg-white transition sm:hidden dark:border-gray-700 dark:bg-gray-800'>
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
