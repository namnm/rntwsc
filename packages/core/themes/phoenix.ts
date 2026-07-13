import type { ThemeConfig } from '@/core/theme/config'
import common from '@/core/themes/common.local.json'
import commonDark from '@/core/themes/common-dark.local.json'
import override from '@/core/themes/phoenix.local.json'
import overrideDark from '@/core/themes/phoenix-dark.local.json'
import { tw } from '@/core/tw/tw'

export const phoenixTheme: ThemeConfig = {
  name: 'phoenix',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-phoenix`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
