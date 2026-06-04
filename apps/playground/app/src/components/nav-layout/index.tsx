'use client'

import type { PropsWithChildren, ReactNode } from 'react'

import { Separator } from '@/rn/components/separator'
import { Span } from '@/rn/components/text'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
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
  rHome,
  rModal,
  rRadio,
  rSelect,
  rSwitch,
  rTextInput,
  rViewport,
  rYhCamera,
  rYhChat,
  rYhHome,
} from '#/pages/route-paths'

export type NavItem = {
  key: string
  label: string
  href?: string
  icon?: ReactNode
  onPress?: () => void
  active?: boolean
}

type NavLayoutProps = PropsWithChildren

const bottomItems: NavItem[] = [
  {
    key: 'home',
    label: 'Home',
    active: true,
  },
  {
    key: 'search',
    label: 'Search',
  },
  {
    key: 'profile',
    label: 'Profile',
  },
]
export const NavLayout = ({ children }: NavLayoutProps) => (
  <View className='flex-1 md:flex-row'>
    <View className='hidden flex-col border-r border-gray-200 bg-white transition md:flex md:w-60 dark:border-gray-700 dark:bg-gray-800'>
      <View className='border-b border-gray-200 px-4 py-5 transition dark:border-gray-700'>
        <Span className='font-semibold text-gray-800 transition dark:text-gray-100'>
          Menu
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
        <NavSidebarLink href={rButtonToggleGroup} label='Button Toggle Group' />
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
          CORE
        </Span>
        <NavSidebarLink href={rViewport} label='Viewport' />
        <Separator />
        <Span className='mb-1 px-2 text-xs font-semibold text-gray-400 transition dark:text-gray-500'>
          YOURHEALTH DEMO
        </Span>
        <NavSidebarLink href={rYhHome} label='YH — Trang chủ' />
        <NavSidebarLink href={rYhCamera} label='YH — Camera / OCR' />
        <NavSidebarLink href={rYhChat} label='YH — AI Chatbox' />
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

      {bottomItems.length > 0 && (
        <View className='flex-row border-t border-gray-200 bg-white transition md:hidden dark:border-gray-700 dark:bg-gray-800'>
          {bottomItems.map(item => (
            <Pressable
              key={item.key}
              onPress={item.onPress}
              className='flex-1 items-center gap-1 py-3'
            >
              {item.icon}
              <Span
                className={[
                  'text-xs transition',
                  item.active
                    ? 'text-primary font-medium'
                    : 'text-gray-500 dark:text-gray-400',
                ]}
              >
                {item.label}
              </Span>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  </View>
)
