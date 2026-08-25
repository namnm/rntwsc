import type { ReactNode } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import type { FlatListPropsWocn } from 'rntwsc/tw/components/without-class-name/flat-list'
import { FlatListWocn } from 'rntwsc/tw/components/without-class-name/flat-list'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type { FlatListRn } from 'rntwsc/tw/components/without-class-name/flat-list'

export type FlatListProps<T> = FlatListPropsWocn<T> & {
  className?: ClassName
  contentContainerClassName?: ClassName
  columnWrapperClassName?: ClassName
}

export const FlatList: <T>(props: FlatListProps<T>) => ReactNode =
  createClassNameComponent({
    FlatListWocn,
    extraClassNameKeys: ['contentContainerClassName', 'columnWrapperClassName'],
  })
