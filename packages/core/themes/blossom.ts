import type { ThemeConfig } from '#/core/theme/config'
import override from '#/core/themes/blossom.local.json'
import overrideDark from '#/core/themes/blossom-dark.local.json'
import common from '#/core/themes/common.local.json'
import commonDark from '#/core/themes/common-dark.local.json'
import { tw } from '#/core/tw/tw'

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
