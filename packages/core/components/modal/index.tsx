'use client'

import type { PropsWithChildren } from 'react'
import { useEffect } from 'react'

import { Portal } from '#/core/components/portal'
import { isWeb } from '#/core/platform'
import type { ClassName } from '#/core/tw/class-name'
import { Pressable } from '#/core/tw/components/pressable'
import { ScrollView } from '#/core/tw/components/scroll-view'
import type { ViewProps } from '#/core/tw/components/view'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'
import { useControllableState } from '#/libs/hooks'
import type { ValueProps } from '#/libs/utility-types'

const modalCva = cva({
  classNames: {
    container: 'web:fixed absolute inset-0 items-center justify-center',
    backdrop: 'absolute inset-0 bg-black/50',
    panel:
      'flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-900',
    content: 'flex-1',
  },
  attributes: {
    size: {
      sm: {
        panel: 'h-[60%] w-80',
      },
      md: {
        panel: 'h-[75%] w-96',
      },
      lg: {
        panel: 'h-[85%] w-[32rem]',
      },
      full: {
        panel: 'h-[90%] w-[90%]',
      },
    },
  },
})

export type ModalProps = ValueProps<boolean> &
  Variant<typeof modalCva> &
  Omit<ViewProps, 'className' | 'children'> &
  PropsWithChildren<{
    className?: ClassName
    contentClassName?: ClassName
    contentContainerClassName?: ClassName
  }>

export const Modal = ({
  size = 'md',
  value,
  defaultValue = false,
  onChange,
  className,
  contentClassName,
  contentContainerClassName,
  children,
  ...rest
}: ModalProps) => {
  const [open, setOpen] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  useEffect(() => {
    if (!open || !isWeb) {
      return
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, setOpen])

  if (!open) {
    return null
  }

  const cn = modalCva({
    size,
  })

  return (
    <Portal disableBodyScroll>
      <View className={cn.container}>
        <Pressable className={cn.backdrop} onPress={() => setOpen(false)} />
        <View
          {...rest}
          role='dialog'
          aria-modal
          className={[cn.panel, className]}
        >
          <ScrollView
            className={[cn.content, contentClassName]}
            contentContainerClassName={contentContainerClassName}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Portal>
  )
}
