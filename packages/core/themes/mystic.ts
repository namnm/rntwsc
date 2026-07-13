import type { ThemeConfig } from '@/core/theme/config'
import common from '@/core/themes/common.local.json'
import commonDark from '@/core/themes/common-dark.local.json'
import override from '@/core/themes/mystic.local.json'
import overrideDark from '@/core/themes/mystic-dark.local.json'
import { tw } from '@/core/tw/tw'

export const mysticTheme: ThemeConfig = {
  name: 'mystic',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-mystic`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
