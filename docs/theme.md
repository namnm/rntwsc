# Theme

10 built-in themes, each with a dark mode variant. Works across server, browser, and native.

Built-in themes: `ruby`, `phoenix`, `sunny`, `forest`, `ocean`, `corporate`, `blossom`, `mystic`, `coffee`, `stone`.

## Setup

Initialize once at app startup (e.g. in your polyfill entry):

```ts
import { initTheme } from '@/core/theme/config'
import { allBuiltinThemes } from '@/core/themes/all'
import { corporateTheme } from '@/core/themes/corporate'

// (available themes, default theme)
initTheme(allBuiltinThemes, corporateTheme)
```

## Reading the current theme

```tsx
import { useTheme, useSetTheme } from '@/core/theme'

// server component (async)
const theme = await useTheme()

// browser component (sync, useSyncExternalStore)
const theme = useTheme()
const setTheme = useSetTheme()
```

Theme is persisted in a cookie (`theme`) so it survives SSR hydration without flash.

## Switching theme

```tsx
const setTheme = useSetTheme()
setTheme('ocean') // switch to ocean
setTheme(undefined) // reset to default
```

On web, `setTheme` updates the cookie and swaps the theme class on `document.documentElement`. On native, it updates the React context and AsyncStorage.

## Drop-in switcher

```tsx
import { ThemeSwitcher } from '#/components/theme-switcher'
;<ThemeSwitcher />
```

## Custom theme

```ts
import type { ThemeConfig } from '@/core/theme/config'
import { tw } from '@/core/tw/tw'

export const myTheme: ThemeConfig = {
  name: 'my-theme',
  className: tw`theme-my-theme`,
  variables: {
    /* CSS variable overrides */
  },
  darkVariables: {
    /* optional dark overrides */
  },
}

// register alongside builtins:
initTheme([...allBuiltinThemes, myTheme], myTheme)
```

Add a corresponding `theme-my-theme` CSS class with your variable definitions in your global CSS.
