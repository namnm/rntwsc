import type { ThemeConfig } from 'rntwsc/theme/config'
import common from 'rntwsc/themes/common.local.json'
import commonDark from 'rntwsc/themes/common-dark.local.json'
import override from 'rntwsc/themes/phoenix.local.json'
import overrideDark from 'rntwsc/themes/phoenix-dark.local.json'
import { tw } from 'rntwsc/tw/tw'

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
