import override from '@/core/themes/coffee.extract-variables.scss'
import overrideDark from '@/core/themes/coffee-dark.extract-variables.scss'
import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
import { tw } from '@/core/tw/tw'

export const coffeeTheme: ThemeConfig = {
  name: 'coffee',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-coffee`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
