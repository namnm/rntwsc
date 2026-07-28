import type { ThemeConfig } from '#/core/theme/config'
import override from '#/core/themes/coffee.local.json'
import overrideDark from '#/core/themes/coffee-dark.local.json'
import common from '#/core/themes/common.local.json'
import commonDark from '#/core/themes/common-dark.local.json'
import { tw } from '#/core/tw/tw'

export const coffeeTheme: ThemeConfig = {
  name: 'coffee',
  // use tw`` here to collect and map when class names are minified
  className: tw`theme-coffee`,
  variables: {
    ...common,
    ...override,
  },
  darkVariables: {
    ...commonDark,
    ...overrideDark,
  },
}
