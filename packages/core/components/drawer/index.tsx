'use client'

import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { Portal } from '#/core/components/portal'
import { useIsRtl } from '#/core/i18n/use-is-rtl'
import { isWeb } from '#/core/platform'
import type { ClassName } from '#/core/tw/class-name'
import { Pressable } from '#/core/tw/components/pressable'
import { ScrollView } from '#/core/tw/components/scroll-view'
import type { ViewProps } from '#/core/tw/components/view'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'

const drawerCva = cva({
  classNames: {
    backdrop: 'web:fixed absolute inset-0 bg-black/50',
    panel:
      'web:fixed absolute flex flex-col overflow-hidden bg-white shadow-xl dark:bg-gray-900',
    handleZone:
      'flex w-full cursor-grab items-center justify-center pt-3 pb-2 select-none',
    indicator: 'h-1.5 w-20 rounded-full bg-gray-300 dark:bg-gray-600',
    content: 'flex-1',
  },
  attributes: {
    side: {
      bottom: {
        panel: 'right-0 bottom-0 left-0 max-h-[90%] rounded-t-2xl',
      },
      left: {
        panel: 'top-0 bottom-0 left-0 h-full w-80 rounded-r-2xl',
      },
      right: {
        panel: 'top-0 right-0 bottom-0 h-full w-80 rounded-l-2xl',
      },
    },
  },
})

export type DrawerProps = Omit<Variant<typeof drawerCva>, 'side'> &
  Omit<ViewProps, 'className' | 'children'> &
  PropsWithChildren<{
    open: boolean
    onClose: () => void
    // 'start'/'end' follow reading direction and mirror under rtl.
    // 'left'/'right' pin to a physical edge. See i18n.md#direction-rtl.
    side?: 'bottom' | 'left' | 'right' | 'start' | 'end'
    className?: ClassName
    contentClassName?: ClassName
    contentContainerClassName?: ClassName
  }>

export const Drawer = async ({
  side = 'bottom',
  open,
  onClose,
  className,
  contentClassName,
  contentContainerClassName,
  children,
  ...rest
}: DrawerProps) => {
  const rtl = await useIsRtl()

  useEffect(() => {
    if (!open || !isWeb) {
      return
    }
    const h = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])

  if (!open) {
    return null
  }

  const resolvedSide =
    side === 'start'
      ? rtl
        ? 'right'
        : 'left'
      : side === 'end'
        ? rtl
          ? 'left'
          : 'right'
        : side

  const cn = drawerCva({
    side: resolvedSide,
  })
  const showHandle = resolvedSide === 'bottom'

  return (
    <Portal disableBodyScroll>
      <Pressable className={cn.backdrop} onPress={onClose} />
      <View {...rest} className={[cn.panel, className]}>
        {showHandle && (
          <View className={cn.handleZone}>
            <View className={cn.indicator} />
          </View>
        )}
        <ScrollView
          className={[cn.content, contentClassName]}
          contentContainerClassName={contentContainerClassName}
        >
          {children}
        </ScrollView>
      </View>
    </Portal>
  )
}
