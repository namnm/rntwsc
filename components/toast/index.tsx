'use client'

import { Portal } from 'rntwsc/components/portal'
import { Span } from 'rntwsc/components/text'
import type { ToastItem } from 'rntwsc/components/toast/store'
import {
  pauseToast,
  removeToast,
  resumeToast,
  useToastItems,
} from 'rntwsc/components/toast/store'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { TextStyleProvider } from 'rntwsc/tw/components/text-style-context'
import { View } from 'rntwsc/tw/components/view'
import { cva } from 'rntwsc/tw/cva'

export type { ToastOptions, ToastType } from 'rntwsc/components/toast/store'
export { toast } from 'rntwsc/components/toast/store'

// ---------------------------------------------
// cva
// ---------------------------------------------

const toastCva = cva({
  classNames: {
    container:
      'w-72 flex-row items-center gap-2 rounded-lg border px-3 py-2.5 shadow-lg',
    text: 'flex-1 text-sm',
  },
  attributes: {
    type: {
      basic: {
        container:
          'border-gray-800 bg-gray-800 dark:border-white dark:bg-white',
        text: 'text-white dark:text-gray-800',
      },
      primary: {
        container: 'border-primary bg-primary',
        text: 'text-white',
      },
      secondary: {
        container: 'border-secondary bg-secondary',
        text: 'text-white',
      },
      info: {
        container: 'border-info bg-info',
        text: 'text-white',
      },
      success: {
        container: 'border-success bg-success',
        text: 'text-white',
      },
      warning: {
        container: 'border-warning bg-warning',
        text: 'text-white',
      },
      error: {
        container: 'border-error bg-error',
        text: 'text-white',
      },
    },
  },
})

// ---------------------------------------------
// item
// ---------------------------------------------

const ToastItemView = ({ item }: { item: ToastItem }) => {
  const cn = toastCva({
    type: item.type,
  })

  return (
    <Pressable
      testID={`toast-${item.id}`}
      onPress={() => removeToast(item.id)}
      onHoverIn={() => pauseToast(item.id)}
      onHoverOut={() => resumeToast(item.id)}
      role='status'
      aria-live={item.type === 'error' ? 'assertive' : 'polite'}
      className={cn.container}
    >
      <TextStyleProvider className={cn.text}>
        <Span>{item.message}</Span>
      </TextStyleProvider>
    </Pressable>
  )
}

// ---------------------------------------------
// Toast - mount once, then trigger with toast({ message })
// ---------------------------------------------

export const Toast = () => {
  const items = useToastItems()

  if (items.length === 0) {
    return null
  }

  return (
    <Portal>
      <View className='web:fixed web:items-end absolute inset-x-0 bottom-0 z-50 items-center gap-2 p-4'>
        {items.map(item => (
          <ToastItemView key={item.id} item={item} />
        ))}
      </View>
    </Portal>
  )
}
