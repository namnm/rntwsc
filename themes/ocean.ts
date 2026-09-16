import type { ThemeConfig } from 'rntwsc/theme/config'
import common from 'rntwsc/themes/common.local.json'
import commonDark from 'rntwsc/themes/common-dark.local.json'
import override from 'rntwsc/themes/ocean.local.json'
import overrideDark from 'rntwsc/themes/ocean-dark.local.json'
import { tw } from 'rntwsc/tw/tw'

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
