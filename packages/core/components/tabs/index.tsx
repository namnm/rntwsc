'use client'

import type { PropsWithChildren } from 'react'
import { createContext } from 'react'

import type { PressableProps } from '#/core/tw/components/pressable'
import { Pressable } from '#/core/tw/components/pressable'
import { TextStyleProvider } from '#/core/tw/components/text-style-context'
import type { ViewProps } from '#/core/tw/components/view'
import { View } from '#/core/tw/components/view'
import type { Variant } from '#/core/tw/cva'
import { cva } from '#/core/tw/cva'
import { useControllableState, useSafeContext } from '#/libs/hooks'
import type { ValueProps } from '#/libs/utility-types'

// ---------------------------------------------
// cva
// ---------------------------------------------

const tabsCva = cva({
  classNames: {
    list: 'flex-row border-b border-gray-200 dark:border-gray-700',
    trigger:
      'flex-row items-center justify-center border-b-2 border-transparent transition-colors',
    triggerLabel: 'font-medium text-gray-500 dark:text-gray-400',
  },
  attributes: {
    size: {
      sm: {
        trigger: 'h-8 gap-1 px-2',
        triggerLabel: 'text-xs',
      },
      md: {
        trigger: 'h-10 gap-1.5 px-3',
        triggerLabel: 'text-sm',
      },
      lg: {
        trigger: 'h-12 gap-2 px-4',
        triggerLabel: 'text-md',
      },
    },
    active: {
      true: {},
    },
    disabled: {
      true: {
        trigger: 'cursor-not-allowed opacity-50',
      },
    },
  },
  compoundVariants: [
    {
      active: true,
      classNames: {
        trigger: 'border-primary',
        triggerLabel: 'text-primary dark:text-primary-400',
      },
    },
  ],
})

type TabsSize = NonNullable<Variant<typeof tabsCva>['size']>

// ---------------------------------------------
// context
// ---------------------------------------------

type TabsContextType = {
  size: TabsSize
  value: string
  onSelect: (value: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)
const useTabs = () => useSafeContext(TabsContext)

// ---------------------------------------------
// Root
// ---------------------------------------------

export type TabsProps = PropsWithChildren<
  ValueProps<string> & {
    size?: TabsSize
    className?: ViewProps['className']
  }
>

const Root = ({
  size = 'md',
  value,
  defaultValue = '',
  onChange,
  className,
  children,
}: TabsProps) => {
  const [state, setState] = useControllableState({
    value,
    defaultValue,
    onChange,
  })

  return (
    <TabsContext.Provider
      value={{
        size,
        value: state,
        onSelect: setState,
      }}
    >
      <View className={className}>{children}</View>
    </TabsContext.Provider>
  )
}

// ---------------------------------------------
// List
// ---------------------------------------------

export type TabsListProps = ViewProps

const List = ({ className, ...props }: TabsListProps) => (
  <View {...props} className={[tabsCva({}).list, className]} />
)

// ---------------------------------------------
// Trigger
// ---------------------------------------------

export type TabsTriggerProps = Omit<PressableProps, 'onPress'> & {
  value: string
  disabled?: boolean
}

const Trigger = ({
  value,
  disabled,
  className,
  children,
  ...props
}: TabsTriggerProps) => {
  const { size, value: ctxValue, onSelect } = useTabs()
  const active = ctxValue === value
  const cn = tabsCva({
    size,
    active,
    disabled,
  })

  return (
    <Pressable
      {...props}
      disabled={disabled}
      onPress={() => onSelect(value)}
      role='tab'
      aria-selected={active}
      className={[cn.trigger, className]}
      renderToHardwareTextureAndroid={disabled}
      shouldRasterizeIOS={disabled}
    >
      <TextStyleProvider className={cn.triggerLabel}>
        {children}
      </TextStyleProvider>
    </Pressable>
  )
}

// ---------------------------------------------
// Content
// ---------------------------------------------

export type TabsContentProps = PropsWithChildren<{
  value: string
  className?: ViewProps['className']
}>

const Content = ({ value, className, children }: TabsContentProps) => {
  const { value: ctxValue } = useTabs()

  if (ctxValue !== value) {
    return null
  }

  return <View className={className}>{children}</View>
}

// ---------------------------------------------
// export
// ---------------------------------------------

export const Tabs = Object.assign(Root, {
  List,
  Trigger,
  Content,
})
