import { Link } from 'react-router'

import { getDefaultLocaleUntyped } from 'rntwsc/i18n/config'
import { useCurrentLocaleUntyped } from 'rntwsc/i18n/index.web'
import { normalizePathname } from 'rntwsc/navigation/normalize-pathname'
import type { LinkPropsWocn } from 'rntwsc/tw/components/without-class-name/link-untyped'
import { qsStableStringify } from 'rntwsc/libs/qs'

// web (Vite SPA) variant of link-untyped.tsx, using react-router's Link
// instead of next/link - see navigation.md
export const LinkUntypedWocn = ({
  pathname,
  query,
  onPress,
  ...props
}: LinkPropsWocn) => {
  const locale = useCurrentLocaleUntyped()
  if (locale !== getDefaultLocaleUntyped()) {
    pathname = normalizePathname(`/${locale}${pathname}`)
  }

  const q = query && qsStableStringify(query)
  const href = q ? `${pathname}?${q}` : pathname

  return <Link onClick={onPress} {...(props as any)} to={href} />
}
