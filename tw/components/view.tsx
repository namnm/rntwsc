import type { FC } from 'react'

import type { ClassName } from 'rntwsc/tw/class-name'
import type { ViewPropsWocn } from 'rntwsc/tw/components/without-class-name/view'
import { ViewWocn } from 'rntwsc/tw/components/without-class-name/view'
import { createClassNameComponent } from 'rntwsc/tw/lib/create-class-name-component'

export type { ViewRn } from 'rntwsc/tw/components/without-class-name/view'

export type ViewProps = ViewPropsWocn & {
  className?: ClassName
}

export const View: FC<ViewProps> = createClassNameComponent({
  ViewWocn,
})
