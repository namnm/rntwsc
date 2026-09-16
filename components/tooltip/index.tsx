'use client'

import type { Placement } from '@floating-ui/react'
import {
  autoUpdate,
  flip,
  offset,
  shift,
  useDismiss,
  useFloating,
  useFocus,
  useHover,
  useInteractions,
  useRole,
} from '@floating-ui/react'
import type { PropsWithChildren, ReactNode } from 'react'
import { useState } from 'react'

import { Portal } from 'rntwsc/components/portal'
import { Slot } from 'rntwsc/components/slot'
import { Span } from 'rntwsc/components/text'
import type { ClassName } from 'rntwsc/tw/class-name'
import { clsx } from 'rntwsc/tw/clsx'

export type TooltipProps = PropsWithChildren<{
  content: ReactNode
  placement?: Placement
  className?: ClassName
}>

export const Tooltip = ({
  children,
  content,
  placement = 'top',
  className,
}: TooltipProps) => {
  const [open, setOpen] = useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    placement,
    middleware: [
      offset(6),
      flip({
        padding: 8,
      }),
      shift({
        padding: 8,
      }),
    ],
    whileElementsMounted: autoUpdate,
  })

  const hover = useHover(context, {
    move: false,
  })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, {
    role: 'tooltip',
  })
  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ])

  const boxClassName = clsx(
    'z-50 max-w-xs rounded-md bg-gray-800 px-2 py-1 shadow-lg dark:bg-white',
    className,
  ) as string

  return (
    <>
      <Slot ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </Slot>
      {/* Tooltip content is non-interactive, unlike Dropdown/Select's
          drawer content, so no FloatingFocusManager focus trap is needed. */}
      {open && (
        <Portal>
          <div
            ref={refs.setFloating}
            className={boxClassName}
            style={floatingStyles}
            {...getFloatingProps()}
          >
            <Span className='text-xs text-white dark:text-gray-800'>
              {content}
            </Span>
          </div>
        </Portal>
      )}
    </>
  )
}
