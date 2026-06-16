import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'
import override from '@/core/themes/phoenix.extract-variables.scss'
import overrideDark from '@/core/themes/phoenix-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
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
