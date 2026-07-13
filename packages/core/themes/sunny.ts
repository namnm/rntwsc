import type { ThemeConfig } from '@/core/theme/config'
import common from '@/core/themes/common.local.json'
import commonDark from '@/core/themes/common-dark.local.json'
import override from '@/core/themes/sunny.local.json'
import overrideDark from '@/core/themes/sunny-dark.local.json'
import { tw } from '@/core/tw/tw'

export const sunnyTheme: ThemeConfig = {
  name: 'sunny',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-sunny`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
