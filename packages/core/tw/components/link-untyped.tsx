import type { ReactNode } from 'react'

import type { ClassName } from '@/core/tw/class-name'
import type { LinkPropsWocn } from '@/core/tw/components/without-class-name/link-untyped'
import { LinkUntypedWocn } from '@/core/tw/components/without-class-name/link-untyped'
import { createClassNameComponent } from '@/core/tw/lib/create-class-name-component'

export type LinkProps<
  Routes = any,
  Data = any,
  K extends keyof Routes = any,
  Q = K extends keyof Data ? Data[K] : never,
> = LinkPropsWocn<Routes, Data, K, Q> & {
  className?: ClassName
}

export type LinkComponent<Routes, Data> = <K extends keyof Routes>(
  p: LinkProps<Routes, Data, K>,
) => ReactNode

export const LinkUntyped: LinkComponent<any, any> = createClassNameComponent({
  LinkUntypedWocn,
})
