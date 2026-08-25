'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Drawer } from 'rntwsc/components/drawer'
import { Dropdown } from 'rntwsc/components/dropdown'
import type { TextInputProps } from 'rntwsc/components/input'
import { TextInput } from 'rntwsc/components/input'
import { Span } from 'rntwsc/components/text'
import { Check } from 'rntwsc/icons/check'
import { useWindowDimensions } from 'rntwsc/responsive/use-window-dimensions'
import { Pressable } from 'rntwsc/tw/components/pressable'
import { cva } from 'rntwsc/tw/cva'
import { useControllableState, useDebouncedValue } from 'rntwsc/libs/hooks'
import type { ValueProps } from 'rntwsc/libs/utility-types'

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

// receives the debounced query text, returning (or resolving to) the
// matching items - the fetcher is expected to do its own filtering, no
// local filtering is applied on top when items is a function
export type ComboboxItemsFn = (
  query: string,
) => ComboboxItem[] | Promise<ComboboxItem[]>
export type ComboboxItems = ComboboxItem[] | ComboboxItemsFn

export type ComboboxProps = Omit<
  TextInputProps,
  'value' | 'defaultValue' | 'onChange' | 'onChangeText' | 'children'
> &
  ValueProps<string> & {
    items: ComboboxItems
    loadingLabel?: string
    noResultsLabel?: string
    // only applies when items is a function - a plain array filters locally
    // and stays instant, matching today's behavior
    debounceMs?: number
  }

export const Combobox = ({
  items,
  loadingLabel = 'Loading...',
  noResultsLabel = 'No results',
  debounceMs = 300,
  value,
  defaultValue,
  onChange,
  disabled,
  ...rest
}: ComboboxProps) => {
  const isItemsFn = typeof items === 'function'
  const staticItems = isItemsFn ? undefined : (items as ComboboxItem[])

  const itemMap = useMemo(
    () => new Map((staticItems || []).map(i => [i.value, i.label])),
    [staticItems],
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

  // keep the displayed text in sync with a controlled `value`/`items` change
  // made from outside (e.g. form.reset()), but never while the field is
  // open/being typed into, so a resync can't clobber the user's own typing
  useEffect(() => {
    if (!open && !isItemsFn) {
      setQuery(itemMap.get(state) || '')
    }
  }, [state, itemMap, open, isItemsFn])

  const dimensions = useWindowDimensions()
  const useDropdown = dimensions && dimensions.width >= 640

  const cn = comboboxCva({})

  // -- async items --

  const [asyncItems, setAsyncItems] = useState<ComboboxItem[]>([])
  const [loading, setLoading] = useState(false)
  const requestIdRef = useRef(0)
  const debouncedQuery = useDebouncedValue(query, isItemsFn ? debounceMs : 0)

  useEffect(() => {
    if (!isItemsFn || !open) {
      return
    }
    const id = ++requestIdRef.current
    const result = (items as ComboboxItemsFn)(debouncedQuery)
    if (result instanceof Promise) {
      setLoading(true)
      result
        .then(data => {
          if (id === requestIdRef.current) {
            setAsyncItems(data)
          }
        })
        .catch(() => undefined)
        .finally(() => {
          if (id === requestIdRef.current) {
            setLoading(false)
          }
        })
    } else {
      setAsyncItems(result)
    }
    // items is intentionally excluded - an inline fetcher is a new
    // reference every render, only the debounced query/open should re-fetch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, open, isItemsFn])

  const filteredItems = useMemo(() => {
    if (isItemsFn) {
      return asyncItems
    }
    if (!query) {
      return staticItems || []
    }
    const q = query.toLowerCase()
    return (staticItems || []).filter(i => i.label.toLowerCase().includes(q))
  }, [isItemsFn, asyncItems, staticItems, query])

  const handleClose = () => {
    setOpen(false)
  }

  const handleSelect = (item: ComboboxItem) => {
    setState(item.value)
    setQuery(item.label)
    handleClose()
  }

  const itemsJsx = loading ? (
    <Span className={cn.statusText}>{loadingLabel}</Span>
  ) : filteredItems.length === 0 ? (
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
