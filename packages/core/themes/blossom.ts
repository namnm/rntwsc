import override from '@/core/themes/blossom.extract-variables.scss'
import overrideDark from '@/core/themes/blossom-dark.extract-variables.scss'
import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
import { tw } from '@/core/tw/tw'

export const blossomTheme: ThemeConfig = {
  name: 'blossom',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-blossom`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
