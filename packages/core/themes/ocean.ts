import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'
import override from '@/core/themes/ocean.extract-variables.scss'
import overrideDark from '@/core/themes/ocean-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
import { tw } from '@/core/tw/tw'

export const oceanTheme: ThemeConfig = {
  name: 'ocean',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-ocean`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
