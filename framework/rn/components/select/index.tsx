'use client'

import { useCallback, useMemo, useState } from 'react'

import { Drawer } from '@/rn/components/drawer'
import { Dropdown } from '@/rn/components/dropdown'
import { inputCva } from '@/rn/components/input/input-cva'
import type { SelectItem, SelectProps } from '@/rn/components/select/select-cva'
import { selectCva } from '@/rn/components/select/select-cva'
import { useSelectItems } from '@/rn/components/select/use-select-items'
import { Span } from '@/rn/components/text'
import { Input } from '@/rn/core/components/input'
import { Pressable } from '@/rn/core/components/pressable'
import { View } from '@/rn/core/components/view'
import { useWindowDimensions } from '@/rn/core/responsive/use-window-dimensions'
import { useControllableState } from '@/rn/core/utils/use-controllable-state'
import { Check } from '@/rn/svg-icons/check'
import { ChevronBottom } from '@/rn/svg-icons/chevron-bottom'

export type {
  SelectItem,
  SelectItems,
  SelectProps,
} from '@/rn/components/select/select-cva'

// --- pure helpers ---

type Segment = { text: string; hl: boolean }

const buildSegments = (
  label: string,
  ranges: [number, number][],
): Segment[] => {
  if (ranges.length === 0) {
    return [{ text: label, hl: false }]
  }
  const segs: Segment[] = []
  let cursor = 0
  for (const [start, end] of ranges) {
    if (cursor < start) {
      segs.push({ text: label.slice(cursor, start), hl: false })
    }
    segs.push({ text: label.slice(start, end), hl: true })
    cursor = end
  }
  if (cursor < label.length) {
    segs.push({ text: label.slice(cursor), hl: false })
  }
  return segs
}

// Splits query into tokens, matches each token against the prefix of a distinct word
// in label. Returns sorted highlight ranges on match, null on miss.
// "a b" matches "Apple Banana" -> [[0,1],[6,7]], skips non-prefix words.
const matchQuery = (
  label: string,
  query: string,
): [number, number][] | null => {
  const tokens = query.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) {
    return []
  }
  const words: [number, number][] = []
  const re = /\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(label)) !== null) {
    words.push([m.index, m.index + m[0].length])
  }
  const ranges: [number, number][] = []
  const used = new Set<number>()
  for (const token of tokens) {
    const lower = token.toLowerCase()
    let found = false
    for (let i = 0; i < words.length; i++) {
      if (used.has(i)) {
        continue
      }
      if (
        label.slice(words[i][0], words[i][1]).toLowerCase().startsWith(lower)
      ) {
        ranges.push([words[i][0], words[i][0] + token.length])
        used.add(i)
        found = true
        break
      }
    }
    if (!found) {
      return null
    }
  }
  return ranges.sort((a, b) => a[0] - b[0])
}

// For local filter or remote with defaultHighlightSearch: word-prefix token matching.
// For remote without defaultHighlightSearch: use server-provided item.highlight ranges.
const getSegments = (
  item: SelectItem,
  query: string,
  isRemote: boolean,
  defaultHighlightSearch: boolean,
): Segment[] => {
  if (isRemote && !defaultHighlightSearch) {
    return buildSegments(item.label, item.highlight || [])
  }
  if (!query) {
    return [{ text: item.label, hl: false }]
  }
  const ranges = matchQuery(item.label, query)
  if (!ranges || ranges.length === 0) {
    return [{ text: item.label, hl: false }]
  }
  return buildSegments(item.label, ranges)
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
  defaultHighlightSearch = false,
  value,
  defaultValue,
  onChange,
  className,
}: SelectProps) => {
  const [active, setActive] = useState(false)
  const [query, setQuery] = useState('')
  const [reference, setReference] = useState<any>(null)
  const setRef = useCallback((el: any) => setReference(el), [])

  const {
    resolvedItems,
    loading,
    handleOpen: openItems,
  } = useSelectItems(items)

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
    if (!multiple) {
      return new Set(state ? [state as string] : [])
    }
    return new Set(Array.isArray(state) ? (state as string[]) : [])
  }, [multiple, state])

  const triggerLabel = useMemo(() => {
    if (!multiple) {
      return itemMap.get(state as string) || ''
    }
    const arr = Array.isArray(state) ? state : []
    if (arr.length === 0) {
      return ''
    }
    return arr.map(v => itemMap.get(v) || v).join(', ')
  }, [multiple, state, itemMap])

  const filteredItems = useMemo(() => {
    if (!isSearchable || onSearch || !query) {
      return resolvedItems
    }
    return resolvedItems.filter(i => matchQuery(i.label, query) !== null)
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

  const fieldCn = inputCva({
    appearance,
    size,
    shape,
    disabled,
    invalid,
    active,
  })
  const cn = selectCva({ size })

  const renderItemLabel = (item: SelectItem, sel: boolean) => {
    const segments = getSegments(
      item,
      query,
      !!onSearch,
      defaultHighlightSearch,
    )
    const hasHighlight = segments.some(s => s.hl)
    return (
      <Span className={[cn.itemLabel, sel && cn.itemLabelActive]}>
        {hasHighlight
          ? segments.map((seg, i) =>
              seg.hl ? (
                <Span key={i} className={cn.itemLabelHighlight}>
                  {seg.text}
                </Span>
              ) : (
                seg.text
              ),
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
        onChangeText={text => {
          setQuery(text)
          onSearch?.(text)
        }}
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
      {!disabled &&
        (useDropdown ? (
          <Dropdown open={active} onClose={handleClose} reference={reference}>
            {searchJsx}
            <Dropdown.ScrollView>{itemsJsx}</Dropdown.ScrollView>
            {doneBtnJsx}
          </Dropdown>
        ) : (
          <Drawer
            value={active}
            onChange={setActive}
            contentContainerClassName='pb-8'
          >
            {titleJsx}
            {searchJsx}
            {itemsJsx}
            {doneBtnJsx}
          </Drawer>
        ))}
    </>
  )
}
