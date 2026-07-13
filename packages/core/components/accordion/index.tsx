'use client'

import type { PropsWithChildren, ReactElement, ReactNode } from 'react'
import {
  Children,
  cloneElement,
  createContext,
  Fragment,
  useState,
} from 'react'
import type { LayoutChangeEvent } from 'react-native'

import { TextStyleProvider } from '@/core/components/text/text-style-context'
import { ChevronBottom } from '@/core/icons/chevron-bottom'
import type { PressableProps } from '@/core/tw/components/pressable'
import { Pressable } from '@/core/tw/components/pressable'
import type { ViewProps } from '@/core/tw/components/view'
import { View } from '@/core/tw/components/view'
import type { Variant } from '@/core/tw/cva'
import { cva } from '@/core/tw/cva'
import { useControllableState, useSafeContext } from '@/libs/hooks'
import type { MultipleProps, SingleProps } from '@/libs/utility-types'

// context

type AccordionContextType = {
  cn: ReturnType<typeof accordionCva>
  value: string | string[]
  setValue: (value: string) => void
  disabled?: boolean
}

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined,
)
const useAccordion = () => useSafeContext(AccordionContext)

type AccordionItemContextType = {
  __first?: boolean
  value: string
  open: boolean
  disabled?: boolean
}

const AccordionItemContext = createContext<
  AccordionItemContextType | undefined
>(undefined)
const useAccordionItem = () => useSafeContext(AccordionItemContext)

// cva

const accordionCva = cva({
  classNames: {
    border:
      'overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700',
    trigger: 'flex cursor-pointer flex-row items-center justify-between',
    triggerBorder: 'border-t border-gray-200 dark:border-gray-700',
    triggerDisabled: 'opacity-70',
    triggerText: 'text-md text-foreground font-medium',
    triggerIcon: 'transition-[transform,rotate]',
    triggerIconOpen: 'rotate-[180deg]',
    triggerIconChevron: 'text-gray-500',
    itemDisabled: 'cursor-not-allowed',
    content: 'relative overflow-hidden transition-[height] duration-200',
    contentInner: '',
    contentText: 'text-md text-gray-600 dark:text-gray-400',
    contentMeasure:
      'pointer-events-none absolute top-0 right-0 left-0 -z-10 opacity-0',
  },
  attributes: {
    gap: {
      sm: {
        trigger: 'px-3 py-2',
        contentInner: 'px-3 pb-2',
        contentMeasure: 'px-3 pb-2',
      },
      md: {
        trigger: 'px-4 py-3',
        contentInner: 'px-4 pb-3',
        contentMeasure: 'px-4 pb-3',
      },
      lg: {
        trigger: 'px-5 py-4',
        contentInner: 'px-5 pb-4',
        contentMeasure: 'px-5 pb-4',
      },
    },
  },
})

// root

type Single = SingleProps & {
  collapsible?: boolean
}
export type AccordionProps = (Single | MultipleProps) &
  Variant<typeof accordionCva> &
  PropsWithChildren<{
    border?: boolean
    disabled?: boolean
  }>

const Root = ({
  multiple,
  gap = 'md',
  border,
  disabled,
  value,
  defaultValue,
  onChange,
  children,
  ...props
}: AccordionProps) => {
  const cn = accordionCva({
    gap,
  })

  const collapsible =
    'collapsible' in props && typeof props.collapsible === 'boolean'
      ? props.collapsible
      : true

  const [state, setState] = useControllableState<string | string[]>({
    value,
    defaultValue,
    onChange: v => {
      if (!multiple && typeof v !== 'string') {
        return
      }
      if (multiple && !Array.isArray(v)) {
        return
      }
      onChange?.(v as any)
    },
  })

  const setValue = (itemValue: string) => {
    if (!multiple) {
      if (!collapsible && state === itemValue) {
        return
      }
      setState(prev => (prev === itemValue ? '' : itemValue))
      return
    }
    setState(prev => {
      const prevArr = Array.isArray(prev) ? prev : []
      if (prevArr.includes(itemValue)) {
        return prevArr.filter(v => v !== itemValue)
      }
      return [...prevArr, itemValue]
    })
  }

  children = Children.toArray(children).map((_c, i) => {
    const c = _c as ReactElement<AccordionItemProps>
    return cloneElement(c, {
      __first: i === 0,
    })
  })
  if (border) {
    children = <View className={cn.border}>{children}</View>
  }

  return (
    <AccordionContext.Provider
      value={{
        cn,
        value: state,
        setValue,
        disabled,
      }}
    >
      {children}
    </AccordionContext.Provider>
  )
}

// trigger

export type AccordionTriggerProps = Omit<PressableProps, 'children'> & {
  children: ReactNode | ((open: boolean) => ReactNode)
}

const Trigger = ({
  className,
  onPress,
  children,
  ...props
}: AccordionTriggerProps) => {
  const { cn, setValue } = useAccordion()
  const { __first, value, open, disabled } = useAccordionItem()

  const onPressComposed: typeof onPress = e => {
    setValue(value)
    onPress?.(e)
  }

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={onPressComposed}
      className={[
        cn.trigger,
        !__first && cn.triggerBorder,
        disabled && cn.triggerDisabled,
        className,
      ]}
    >
      <TextStyleProvider className={cn.triggerText}>
        {typeof children === 'function' ? (
          children(open)
        ) : (
          <Fragment>
            {children}
            <View className={[cn.triggerIcon, open && cn.triggerIconOpen]}>
              <ChevronBottom className={cn.triggerIconChevron} />
            </View>
          </Fragment>
        )}
      </TextStyleProvider>
    </Pressable>
  )
}

// item

export type AccordionItemProps = ViewProps & {
  __first?: boolean
  value: string
  disabled?: boolean
}

const Item = ({
  __first,
  value,
  disabled,
  className,
  children,
  ...props
}: AccordionItemProps) => {
  const { cn, value: ctxValue, disabled: ctxDisabled } = useAccordion()
  const open = (Array.isArray(ctxValue) ? ctxValue : [ctxValue]).includes(value)
  disabled = ctxDisabled || disabled

  return (
    <AccordionItemContext.Provider
      value={{
        __first,
        value,
        open,
        disabled,
      }}
    >
      <View {...props} className={[disabled && cn.itemDisabled, className]}>
        {children}
      </View>
    </AccordionItemContext.Provider>
  )
}

// content

export type AccordionContentProps = ViewProps

const Content = ({ className, children, ...props }: AccordionContentProps) => {
  const { cn } = useAccordion()
  const { open } = useAccordionItem()
  const [contentHeight, setContentHeight] = useState(0)

  const onLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout
    setContentHeight(height)
  }

  return (
    <View
      className={cn.content}
      style={
        open && !contentHeight
          ? undefined
          : {
              height: open ? contentHeight : 0,
            }
      }
    >
      <TextStyleProvider className={cn.contentText}>
        <View onLayout={onLayout} className={[cn.contentMeasure, className]}>
          {children}
        </View>
        <View {...props} className={[cn.contentInner, className]}>
          {children}
        </View>
      </TextStyleProvider>
    </View>
  )
}

// export

export const Accordion = Object.assign(Root, {
  Trigger,
  Item,
  Content,
})
