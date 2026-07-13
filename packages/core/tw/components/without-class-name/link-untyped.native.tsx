/* eslint-disable no-restricted-imports */

import { Link } from '@react-navigation/native'

import { omit } from '@/core/lodash'
import type { LinkPropsWocn } from '@/core/tw/components/without-class-name/link-untyped'

const webProps: (keyof LinkPropsWocn)[] = ['scroll']

export const LinkUntypedWocn = ({ pathname, query, ...props }: any) => {
  props = omit(props, webProps)
  return <Link {...props} screen={pathname} params={query} />
}
