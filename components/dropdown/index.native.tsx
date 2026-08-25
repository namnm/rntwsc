import type { MiddlewareState } from '@floating-ui/react-native'
import {
  flip,
  offset,
  shift,
  size,
  useFloating,
} from '@floating-ui/react-native'
import type { PropsWithChildren } from 'react'
import { useState } from 'react'

import { Portal } from 'rntwsc/components/portal'
import type { ClassName } from 'rntwsc/tw/class-name'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { ScrollView as ScrollViewOriginal } from 'rntwsc/tw/components/scroll-view'
import { View } from 'rntwsc/tw/components/view'

export type DropdownProps = PropsWithChildren<{
  open: boolean
  onClose: () => void
  reference: any
}>

const Item = ({ open, onClose, reference, children }: DropdownProps) => {
  const [minWidth, setMinWidth] = useState(0)

  const { refs, floatingStyles } = useFloating({
    placement: 'bottom-start',
    elements: {
      reference,
    },
    middleware: [
      offset(4),
      flip({
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
      size({
        apply: ({ rects }: MiddlewareState) => {
          setMinWidth(rects.reference.width)
        },
        padding: 8,
      }),
    ],
    sameScrollView: false,
  })

  if (!open || !reference) {
    return null
  }

  return (
    <Portal>
      <Pressable className='absolute inset-0' onPress={onClose} />
      <View
        ref={refs.setFloating}
        className='overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900'
        style={[
          floatingStyles,
          {
            minWidth,
            opacity: minWidth > 0 ? 1 : 0,
          },
        ]}
      >
        {children}
      </View>
    </Portal>
  )
}

// fix rnw not establishing a bounded scroll container
// inside a flex column parent with no fixed height
type ScrollViewProps = PropsWithChildren<{
  className?: ClassName
}>
const ScrollView = ({ children, className }: ScrollViewProps) => (
  <ScrollViewOriginal className={['max-h-60', className]}>
    {children}
  </ScrollViewOriginal>
)

export const Dropdown = Object.assign(Item, {
  ScrollView,
})
