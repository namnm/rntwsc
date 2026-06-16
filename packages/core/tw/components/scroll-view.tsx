import type { FC } from 'react'

import type { ClassName } from '@/core/tw/class-name'
import type { ScrollViewPropsWocn } from '@/core/tw/components/without-class-name/scroll-view'
import { ScrollViewWocn } from '@/core/tw/components/without-class-name/scroll-view'
import { createClassNameComponent } from '@/core/tw/lib/create-class-name-component'

export type { ScrollViewRn } from '@/core/tw/components/without-class-name/scroll-view'

export type ScrollViewProps = ScrollViewPropsWocn & {
  className?: ClassName
  contentContainerClassName?: ClassName
}

export const ScrollView: FC<ScrollViewProps> = createClassNameComponent({
  ScrollViewWocn,
  extraClassNameKeys: ['contentContainerClassName'],
})
