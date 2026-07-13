# Theme

10 built-in themes, each with a dark mode variant. Works across server, browser, and native. See dark-mode.md for the separate dark, light, and system toggle that switches between a theme's two variants.

Built-in themes: ruby, phoenix, sunny, forest, ocean, corporate, blossom, mystic, coffee, stone.

## Setup

Initialize once at app startup (for example in your polyfill entry):

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

Theme is persisted in a cookie named theme so it survives SSR hydration without a flash.

## Switching theme

```tsx
const setTheme = useSetTheme()
setTheme('ocean') // switch to ocean
setTheme(undefined) // reset to default
```

On web, setTheme updates the cookie and swaps the theme class on the document element. On native, it updates the React context and AsyncStorage.

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
  variables: {/* CSS variable overrides */},
  darkVariables: {/* optional dark overrides */},
}

// register alongside builtins:
initTheme([...allBuiltinThemes, myTheme], myTheme)
```

Add a corresponding theme-my-theme CSS class with your variable definitions in your global CSS. If you want variables read back out as plain JS (as the built in themes do), name the file with an extract-variables.css or extract-variables.scss suffix and run pnpm css-extract-variables - see contribution/dev.md.
