# Development

## Prerequisites

- Node.js, pnpm
- For iOS: Xcode + CocoaPods
- For Android: Android Studio + emulator

## Running the playground

```sh
pnpm install

# Web (Next.js)
cd playground/web
pnpm start

# React Native (Metro)
cd playground/app
pnpm start
```

## Building packages

```sh
pnpm dist
```

Compiles all four modules (`shared`, `nodejs`, `core`, `devtools`) to `dist/` in dependency order. See [dist.md](dist.md) for details.

## Workspace layout

```
packages/core           framework source
playground/app        React Native app + shared pages
playground/web        Next.js app
dist                  dist output (committed on dist branch)
```

## Adding an SVG icon

1. Add the `.svg` file to `packages/core/svg-icons/`
2. Set `fill="currentColor"` (or `stroke="currentColor"`) in the SVG so color inherits from `text-*`
3. Add a `.ts` re-export alongside it:

```ts
// packages/core/svg-icons/star.ts
export { default } from './star.svg'
```

4. Import and use via `#/svg-icons/<name>.svg`
