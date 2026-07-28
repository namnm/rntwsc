import type { FC } from 'react'

import type { ClassName } from '#/core/tw/class-name'
import type { ViewPropsWocn } from '#/core/tw/components/without-class-name/view'
import { ViewWocn } from '#/core/tw/components/without-class-name/view'
import { createClassNameComponent } from '#/core/tw/lib/create-class-name-component'

export type { ViewRn } from '#/core/tw/components/without-class-name/view'

export type ViewProps = ViewPropsWocn & {
  className?: ClassName
}

export const View: FC<ViewProps> = createClassNameComponent({
  ViewWocn,
})
