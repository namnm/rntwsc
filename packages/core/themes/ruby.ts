import type { ThemeConfig } from '@/core/theme/config'
import common from '@/core/themes/common.local.json'
import commonDark from '@/core/themes/common-dark.local.json'
import override from '@/core/themes/ruby.local.json'
import overrideDark from '@/core/themes/ruby-dark.local.json'
import { tw } from '@/core/tw/tw'

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
