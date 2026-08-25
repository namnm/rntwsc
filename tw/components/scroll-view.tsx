import type { FC } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import type { ScrollViewPropsWocn } from 'rntwsc/tw/components/without-class-name/scroll-view'
import { ScrollViewWocn } from 'rntwsc/tw/components/without-class-name/scroll-view'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type { ScrollViewRn } from 'rntwsc/tw/components/without-class-name/scroll-view'

export type ScrollViewProps = ScrollViewPropsWocn & {
  className?: ClassName
  contentContainerClassName?: ClassName
}

export const ScrollView: FC<ScrollViewProps> = createClassNameComponent({
  ScrollViewWocn,
  extraClassNameKeys: ['contentContainerClassName'],
})
