import type { ThemeConfig } from '#/core/theme/config'
import common from '#/core/themes/common.local.json'
import commonDark from '#/core/themes/common-dark.local.json'
import override from '#/core/themes/corporate.local.json'
import overrideDark from '#/core/themes/corporate-dark.local.json'
import { tw } from '#/core/tw/tw'

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
