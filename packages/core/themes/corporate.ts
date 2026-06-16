import common from '@/core/themes/common.extract-variables.scss'
import commonDark from '@/core/themes/common-dark.extract-variables.scss'
import override from '@/core/themes/corporate.extract-variables.scss'
import overrideDark from '@/core/themes/corporate-dark.extract-variables.scss'

import type { ThemeConfig } from '@/core/theme/config'
import { tw } from '@/core/tw/tw'

export const corporateTheme: ThemeConfig = {
  name: 'corporate',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-corporate`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
