import type { Placement } from '@floating-ui/react-native'
import { flip, offset, shift, useFloating } from '@floating-ui/react-native'
import type { PropsWithChildren, ReactNode } from 'react'
import { useState } from 'react'

import { Portal } from '#/core/components/portal'
import { Slot } from '#/core/components/slot'
import { Span } from '#/core/components/text'
import type { ClassName } from '#/core/tw/class-name'
import { Pressable } from '#/core/tw/components/pressable'
import { View } from '#/core/tw/components/view'

export type TooltipProps = PropsWithChildren<{
  content: ReactNode
  placement?: Placement
  className?: ClassName
}>

// Hover doesn't exist on touchscreens, so the native trigger is a long
// press instead - mirrors dropdown/index.native.tsx's backdrop-dismiss shape.
export const Tooltip = ({
  children,
  content,
  placement = 'top',
  className,
}: TooltipProps) => {
  const [open, setOpen] = useState(false)
  const [reference, setReference] = useState<any>(null)

  const { refs, floatingStyles } = useFloating({
    placement,
    elements: {
      reference,
    },
    middleware: [
      offset(6),
      flip({
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
    ],
    sameScrollView: false,
  })

  return (
    <>
      <Slot ref={setReference} onLongPress={() => setOpen(true)}>
        {children}
      </Slot>
      {open && reference && (
        <Portal>
          <Pressable
            className='absolute inset-0'
            onPress={() => setOpen(false)}
          />
          <View
            ref={refs.setFloating}
            className={[
              'z-50 max-w-xs rounded-md bg-gray-800 px-2 py-1 dark:bg-white',
              className,
            ]}
            style={floatingStyles}
          >
            <Span className='text-xs text-white dark:text-gray-800'>
              {content}
            </Span>
          </View>
        </Portal>
      )}
    </>
  )
}
