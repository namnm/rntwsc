import type { InputCva } from '@/core/components/input/input-cva'
import type { ClassName } from '@/core/tw/class-name'
import { cva } from '@/core/tw/cva'
import type { MultipleProps, SingleProps } from '@/libs/utility-types'

export const selectCva = cva({
  classNames: {
    trigger: 'flex-row items-center',
    label: 'flex-1',
    placeholder: 'flex-1',
    titleBar: 'border-b border-gray-100 px-4 py-3 dark:border-gray-800',
    titleText: 'font-semibold text-gray-800 transition dark:text-white',
    searchBar: 'border-b border-gray-100 px-4 py-2 dark:border-gray-800',
    searchInput:
      'w-full rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-800 dark:bg-gray-800 dark:text-white',
    item: 'flex-row items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-800',
    itemActive: 'dark:bg-primary/10 bg-primary-50',
    itemLabel: 'text-sm text-gray-800 dark:text-white',
    itemLabelActive: 'text-primary font-medium',
    itemLabelHighlight: 'bg-yellow-200 dark:bg-yellow-800/40',
    itemCheck: 'text-primary',
    statusText:
      'px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-600',
    doneBar: 'border-t border-gray-100 px-4 py-3 dark:border-gray-800',
    doneBtn: 'bg-primary items-center rounded-lg py-2',
    doneBtnLabel: 'text-sm font-semibold text-white',
  },
  attributes: {
    size: {
      sm: {
        trigger: 'gap-1',
      },
      md: {
        trigger: 'gap-1.5',
      },
      lg: {
        trigger: 'gap-2',
      },
    },
  },
})

export type SearchStrategy = 'word-prefix' | 'acronym' | 'contains' | 'value'

// [start, end) ranges to highlight in item.label - provided by server for remote search
export type SelectItem = {
  value: string
  label: string
  highlight?: [number, number][]
}
export type ItemsFn = () => SelectItem[] | Promise<SelectItem[]>
export type SelectItems = SelectItem[] | ItemsFn

type BaseProps = Omit<InputCva, 'active'> & {
  items: SelectItems
  placeholder?: string
  title?: string
  doneLabel?: string
  loadingLabel?: string
  emptyLabel?: string
  searchable?: boolean
  searchPlaceholder?: string
  searchStrategies?: SearchStrategy[]
  onSearch?: (query: string) => void
  defaultHighlightSearch?: boolean
  className?: ClassName
}

export type SelectProps = (SingleProps | MultipleProps) & BaseProps
