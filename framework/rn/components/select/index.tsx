'use client'

import { useCallback, useMemo, useState } from 'react'

import { Drawer } from '@/rn/components/drawer'
import { Dropdown } from '@/rn/components/dropdown'
import { inputCva } from '@/rn/components/input/input-cva'
import { Span } from '@/rn/components/text'
import { Input } from '@/rn/core/components/input'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { useWindowDimensions } from '@/rn/core/responsive/use-window-dimensions'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { Check } from '@/rn/svg-icons/check'
import { ChevronBottom } from '@/rn/svg-icons/chevron-bottom'

import type { SelectItem, SelectProps } from './select-cva'
import { selectCva } from './select-cva'
import { useSelectItems } from './use-select-items'

export type { SelectItem, SelectItems, SelectProps } from './select-cva'

// --- pure helpers ---

type Segment = { text: string; hl: boolean }

const buildSegments = (label: string, ranges: [number, number][]): Segment[] => {
  if (ranges.length === 0) return [{ text: label, hl: false }]
  const segs: Segment[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (cursor < start) segs.push({ text: label.slice(cursor, start), hl: false })
    segs.push({ text: label.slice(start, end), hl: true })
    cursor = end
  }
  if (cursor < label.length) segs.push({ text: label.slice(cursor), hl: false })
  return segs
}

// For local filter: single contiguous match. For remote: use item.highlight ranges.
const getSegments = (item: SelectItem, query: string, isRemote: boolean): Segment[] => {
  if (isRemote) return buildSegments(item.label, item.highlight || [])
  if (!query) return [{ text: item.label, hl: false }]
  const idx = item.label.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return [{ text: item.label, hl: false }]
  return buildSegments(item.label, [[idx, idx + query.length]])
}

// --- component ---

export const Select = ({
  multiple,
  appearance = 'outlined',
  size = 'md',
  shape = 'rounded',
  disabled,
  items,
  placeholder = 'Select an option',
  title,
  doneLabel = 'Done',
  invalid,
  searchable,
  searchPlaceholder = 'Search...',
  onSearch,
  value,
  defaultValue,
  onChange,
  className,
}: SelectProps) => {
  const [active, setActive] = useState(false)
  const [query, setQuery] = useState('')
  const [reference, setReference] = useState<any>(null)
  const setRef = useCallback((el: any) => setReference(el), [])

  const { resolvedItems, loading, handleOpen: openItems } = useSelectItems(items)

  const [state, setState] = useControllableState<string | string[]>({
    value: value as any,
    defaultValue: defaultValue ?? (multiple ? [] : ''),
    onChange: onChange as any,
  })

  const dimensions = useWindowDimensions()
  const useDropdown = dimensions && dimensions.width >= 640
  const isSearchable = searchable || !!onSearch

  const itemMap = useMemo(
    () => new Map(resolvedItems.map(i => [i.value, i.label])),
    [resolvedItems],
  )
  const selectedSet = useMemo(() => {
    if (!multiple) return new Set(state ? [state as string] : [])
    return new Set(Array.isArray(state) ? (state as string[]) : [])
  }, [multiple, state])

  const triggerLabel = useMemo(() => {
    if (!multiple) return itemMap.get(state as string) || ''
    const arr = Array.isArray(state) ? state : []
    if (arr.length === 0) return ''
    return arr.map(v => itemMap.get(v) || v).join(', ')
  }, [multiple, state, itemMap])

  const filteredItems = useMemo(() => {
    if (!isSearchable || onSearch || !query) return resolvedItems
    const lower = query.toLowerCase()
    return resolvedItems.filter(i => i.label.toLowerCase().includes(lower))
  }, [isSearchable, onSearch, query, resolvedItems])

  const handleOpen = () => {
    setActive(true)
    openItems()
  }

  const handleClose = () => {
    setActive(false)
    setQuery('')
  }

  const handleSelect = (item: SelectItem) => {
    if (!multiple) {
      setState(item.value)
      handleClose()
      return
    }
    setState(prev => {
      const arr = Array.isArray(prev) ? prev : []
      return arr.includes(item.value)
        ? arr.filter(v => v !== item.value)
        : [...arr, item.value]
    })
  }

  const fieldCn = inputCva({ appearance, size, shape, disabled, invalid, active })
  const cn = selectCva({ size })

  const renderItemLabel = (item: SelectItem, sel: boolean) => {
    const segments = getSegments(item, query, !!onSearch)
    const hasHighlight = segments.some(s => s.hl)
    return (
      <Span className={[cn.itemLabel, sel && cn.itemLabelActive]}>
        {hasHighlight
          ? segments.map((seg, i) =>
              seg.hl
                ? <Span key={i} className={cn.itemLabelHighlight}>{seg.text}</Span>
                : seg.text,
            )
          : item.label}
      </Span>
    )
  }

  const titleJsx = !useDropdown && title && (
    <View className={cn.titleBar}>
      <Span className={cn.titleText}>{title}</Span>
    </View>
  )
  const searchJsx = isSearchable && (
    <View className={cn.searchBar}>
      <Input
        className={cn.searchInput}
        value={query}
        onChangeText={text => { setQuery(text); onSearch?.(text) }}
        placeholder={searchPlaceholder}
        autoCorrect={false}
        autoCapitalize='none'
      />
    </View>
  )
  const itemsJsx = loading ? (
    <Span className={cn.statusText}>Loading...</Span>
  ) : filteredItems.length === 0 ? (
    <Span className={cn.statusText}>No results</Span>
  ) : (
    filteredItems.map(item => {
      const sel = selectedSet.has(item.value)
      return (
        <Pressable
          key={item.value}
          onPress={() => handleSelect(item)}
          className={[cn.item, sel && cn.itemActive]}
        >
          {renderItemLabel(item, sel)}
          {sel && <Check className={cn.itemCheck} />}
        </Pressable>
      )
    })
  )
  const doneBtnJsx = multiple && (
    <View className={cn.doneBar}>
      <Pressable className={cn.doneBtn} onPress={handleClose}>
        <Span className={cn.doneBtnLabel}>{doneLabel}</Span>
      </Pressable>
    </View>
  )

  return (
    <>
      <Pressable
        ref={setRef}
        disabled={disabled}
        onPress={handleOpen}
        className={[fieldCn.container, cn.trigger, className]}
        renderToHardwareTextureAndroid={disabled}
        shouldRasterizeIOS={disabled}
      >
        <Span
          className={
            triggerLabel
              ? [fieldCn.label, cn.label]
              : [fieldCn.placeholder, cn.placeholder]
          }
        >
          {triggerLabel || placeholder}
        </Span>
        <ChevronBottom className={fieldCn.chevron} />
      </Pressable>
      {!disabled && (
        useDropdown ? (
          <Dropdown open={active} onClose={handleClose} reference={reference}>
            {searchJsx}
            <Dropdown.ScrollView>{itemsJsx}</Dropdown.ScrollView>
            {doneBtnJsx}
          </Dropdown>
        ) : (
          <Drawer value={active} onChange={setActive} contentContainerClassName='pb-8'>
            {titleJsx}
            {searchJsx}
            {itemsJsx}
            {doneBtnJsx}
          </Drawer>
        )
      )}
    </>
  )
}
