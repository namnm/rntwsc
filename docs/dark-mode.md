# Dark mode

Three states: dark, light, or system (follow the OS color scheme). Independent from theme - dark mode toggles the dark variant of whichever theme is active, via the dark: selector prefix (see tailwind.md). Works across server, browser, and native.

## Reading and setting dark mode

```tsx
import { useDarkModeUser, useSetDarkMode } from '@/core/dark-mode'

// server component (async) - the user's stored choice, true, false, or undefined (system)
const dark = await useDarkModeUser()

// browser component (sync, useSyncExternalStore)
const dark = useDarkModeUser()
const setDarkMode = useSetDarkMode()
setDarkMode(true) // dark
setDarkMode(false) // light
setDarkMode(undefined) // follow system
```

On web, the choice is persisted in a cookie (dark-mode) so it survives SSR hydration without a flash. On native, it is persisted via storage (see packages/libs/storage) instead.

## Resolving the effective state

useDarkModeUser only returns the user's stored choice, not whether the OS is actually in dark mode. packages/core/dark-mode/use-dark-mode-state.ts's useDarkModeState combines the two: it reads useDarkModeUser and react-native's useColorScheme, resolves system as the OS color scheme when the user has not chosen explicitly, and returns the class name state (dark: true/false, light: true/false) that drives the dark: and light: Tailwind selectors on the root element.

```tsx
import { useDarkModeState } from '@/core/dark-mode/use-dark-mode-state'

// only meaningful in browser and native - null on the server until mounted,
// so the resolved system value never mismatches what was server rendered
const state = await useDarkModeState()
```

## Drop-in switcher

There is no framework-provided switcher component - playground/app/src/components/dark-mode-switcher.tsx shows the pattern: read useDarkModeUser and call useSetDarkMode with true, false, or undefined for a dark, light, or system option.

## Setup on native

```ts
import { initDarkModeNative } from '@/core/dark-mode/index.native'

// call once at app startup, before rendering, same as theme and i18n init
await initDarkModeNative()
```

## Internals

Platform entry points in packages/core/dark-mode/:

| File              | Used by            | How                                                                                                                      |
| ----------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| index.tsx         | Server components  | Reads the dark-mode cookie via next-unchecked headers; setter is a server no-op polyfill                                 |
| index.browser.tsx | Browser components | Reads and writes the dark-mode cookie via js-cookie; setter also toggles the dark or light class on the document element |
| index.native.tsx  | React Native       | Reads and writes the same key through storage; exports initDarkModeNative() to preload the value at startup              |
