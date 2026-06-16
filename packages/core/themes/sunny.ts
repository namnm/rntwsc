import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'
import override from '@/core/themes/sunny.extract-variables.scss'
import overrideDark from '@/core/themes/sunny-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
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
