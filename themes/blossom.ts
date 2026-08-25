import type { ThemeConfig } from 'rntwsc/theme/config'
import override from 'rntwsc/themes/blossom.local.json'
import overrideDark from 'rntwsc/themes/blossom-dark.local.json'
import common from 'rntwsc/themes/common.local.json'
import commonDark from 'rntwsc/themes/common-dark.local.json'
import { tw } from 'rntwsc/tw/tw'

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
