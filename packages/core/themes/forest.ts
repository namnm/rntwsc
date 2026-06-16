import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'
import override from '@/core/themes/forest.extract-variables.scss'
import overrideDark from '@/core/themes/forest-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
import { tw } from '@/core/tw/tw'

export const forestTheme: ThemeConfig = {
  name: 'forest',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-forest`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
