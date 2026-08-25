import type { ThemeConfig } from 'rntwsc/theme/config'
import common from 'rntwsc/themes/common.local.json'
import commonDark from 'rntwsc/themes/common-dark.local.json'
import override from 'rntwsc/themes/corporate.local.json'
import overrideDark from 'rntwsc/themes/corporate-dark.local.json'
import { tw } from 'rntwsc/tw/tw'

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
