import type { ThemeConfig } from 'rntwsc/theme/config'
import common from 'rntwsc/themes/common.local.json'
import commonDark from 'rntwsc/themes/common-dark.local.json'
import override from 'rntwsc/themes/mystic.local.json'
import overrideDark from 'rntwsc/themes/mystic-dark.local.json'
import { tw } from 'rntwsc/tw/tw'

export const mysticTheme: ThemeConfig = {
  name: 'mystic',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-mystic`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
