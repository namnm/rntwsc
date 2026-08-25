import type { ThemeConfig } from 'rntwsc/theme/config'
import common from 'rntwsc/themes/common.local.json'
import commonDark from 'rntwsc/themes/common-dark.local.json'
import override from 'rntwsc/themes/ruby.local.json'
import overrideDark from 'rntwsc/themes/ruby-dark.local.json'
import { tw } from 'rntwsc/tw/tw'

export const rubyTheme: ThemeConfig = {
  name: 'ruby',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-ruby`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
