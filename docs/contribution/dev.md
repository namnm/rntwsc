# Development

## Prerequisites

- Node.js, pnpm
- For iOS: Xcode + CocoaPods
- For Android: Android Studio + emulator

## Running the playground

```sh
pnpm install

# Web (Next.js)
pnpm --filter playground-web dev

# React Native (Metro)
pnpm --filter playground start
# then press i (iOS) or a (Android)
```

## Building packages

```sh
pnpm dist
```

Compiles all four modules (`shared`, `nodejs`, `rn`, `devtools`) to `dist/` in dependency order. See [build.md](build.md) for details.

## Workspace layout

```
packages/rn/          framework source
playground/           React Native app + shared pages
playground-web/       Next.js app
dist/                 build output (committed on dist branch)
scripts/              build scripts
```

## Adding an SVG icon

1. Add the `.svg` file to `packages/rn/svg-icons/`
2. Set `fill="currentColor"` (or `stroke="currentColor"`) in the SVG so color inherits from `text-*`
3. Add a `.ts` re-export alongside it:

```ts
// packages/rn/svg-icons/star.ts
export { default } from './star.svg'
```

4. Import and use via `#/svg-icons/<name>.svg`
