'use client'

import { useCallback, useMemo, useState } from 'react'

import { Drawer } from '#/core/components/drawer'
import { Dropdown } from '#/core/components/dropdown'
import type { TextInputProps } from '#/core/components/input'
import { TextInput } from '#/core/components/input'
import { Span } from '#/core/components/text'
import { Check } from '#/core/icons/check'
import { useWindowDimensions } from '#/core/responsive/use-window-dimensions'
import { Pressable } from '#/core/tw/components/pressable'
import { cva } from '#/core/tw/cva'
import { useControllableState } from '#/libs/hooks'
import type { ValueProps } from '#/libs/utility-types'

// ---------------------------------------------
// cva
// ---------------------------------------------

const comboboxCva = cva({
  classNames: {
    item: 'flex-row items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800',
    itemActive: 'dark:bg-primary/10 bg-primary-50',
    itemLabel: 'text-sm text-gray-800 dark:text-white',
    itemLabelActive: 'text-primary font-medium',
    itemCheck: 'text-primary',
    statusText:
      'px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-600',
  },
})

// ---------------------------------------------
// Combobox
// ---------------------------------------------

export type ComboboxItem = {
  value: string
  label: string
}

export type ComboboxProps = Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChange' | 'onChangeText' | 'children'
> &
  ValueProps<string> & {
    items: ComboboxItem[]
    noResultsLabel?: string
  }

export const Combobox = ({
  items,
  noResultsLabel = 'No results',
  value,
  defaultValue,
  onChange,
  disabled,
  ...rest
}: ComboboxProps) => {
  const itemMap = useMemo(
    () => new Map(items.map(i => [i.value, i.label])),
    [items],
  )

  const [state, setState] = useControllableState({
    value,
    defaultValue: defaultValue ?? '',
    onChange,
  })
  const [query, setQuery] = useState(() => itemMap.get(state) || '')
  const [open, setOpen] = useState(false)
  const [reference, setReference] = useState<any>(null)
  const setRef = useCallback((el: any) => setReference(el), [])

  const dimensions = useWindowDimensions()
  const useDropdown = dimensions && dimensions.width >= 640

  const cn = comboboxCva({})

  const filteredItems = useMemo(() => {
    if (!query) {
      return items
    }
    const q = query.toLowerCase()
    return items.filter(i => i.label.toLowerCase().includes(q))
  }, [items, query])

  const handleClose = () => {
    setOpen(false)
  }

  const handleSelect = (item: ComboboxItem) => {
    setState(item.value)
    setQuery(item.label)
    handleClose()
  }

  const itemsJsx =
    filteredItems.length === 0 ? (
      <Span className={cn.statusText}>{noResultsLabel}</Span>
    ) : (
      filteredItems.map(item => {
        const sel = item.value === state
        return (
          <Pressable
            key={item.value}
            onPress={() => handleSelect(item)}
            className={[cn.item, sel && cn.itemActive]}
          >
            <Span className={[cn.itemLabel, sel && cn.itemLabelActive]}>
              {item.label}
            </Span>
            {sel && <Check className={cn.itemCheck} />}
          </Pressable>
        )
      })
    )

  return (
    <>
      <TextInput
        {...rest}
        ref={setRef}
        disabled={disabled}
        value={query}
        onFocus={() => setOpen(true)}
        onChangeText={text => {
          setQuery(text)
          setOpen(true)
        }}
      />
      {!disabled &&
        (useDropdown ? (
          <Dropdown open={open} onClose={handleClose} reference={reference}>
            <Dropdown.ScrollView>{itemsJsx}</Dropdown.ScrollView>
          </Dropdown>
        ) : (
          <Drawer
            open={open}
            onClose={handleClose}
            contentContainerClassName='pb-8'
          >
            {itemsJsx}
          </Drawer>
        ))}
    </>
  )
}
