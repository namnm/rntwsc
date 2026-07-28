import type { ThemeConfig } from '#/core/theme/config'
import common from '#/core/themes/common.local.json'
import commonDark from '#/core/themes/common-dark.local.json'
import override from '#/core/themes/ocean.local.json'
import overrideDark from '#/core/themes/ocean-dark.local.json'
import { tw } from '#/core/tw/tw'

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
