<!-- START doctoc -->

- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Running the playground](#running-the-playground)
  - [Building packages](#building-packages)
  - [Extracting theme CSS variables](#extracting-theme-css-variables)
  - [Workspace layout](#workspace-layout)
  - [Adding an SVG icon](#adding-an-svg-icon)

<!-- END doctoc -->

# Development

## Prerequisites

- Node.js, pnpm
- For iOS: Xcode + CocoaPods
- For Android: Android Studio + emulator

## Running the playground

```sh
pnpm install

# Web (Next.js, turbopack) - faster, use this by default
cd playground/turbopack
pnpm start

# Web (Next.js, webpack) - a copy of turbopack's src, kept in sync via pnpm copy
# only needed when checking webpack-specific behavior
cd playground/webpack
pnpm copy
pnpm start

# React Native (Metro)
cd playground/app
pnpm start
```

## Building packages

```sh
pnpm dist
```

Copies the two modules, core and devtools, to dist/. See build.md for details.

## Extracting theme CSS variables

```sh
pnpm css-extract-variables
```

Run this after changing any file named with an extract-variables.css or extract-variables.scss suffix (for example the built in themes). It regenerates the matching local.json sibling the theme code reads at runtime. This also runs automatically as part of pnpm dist.

## Workspace layout

```
packages/core         framework source
packages/devtools     build tooling: babel, eslint, next-config, metro-config..
playground/app        React Native app plus shared pages
playground/turbopack  Next.js app, primary source, runs with the turbopack flag, faster, default choice
playground/webpack    Next.js app, a copy of turbopack's src, runs with the webpack flag
dist                  dist output, committed on the dist branch
```

## Adding an SVG icon

1. Add the svg file to packages/core/svg-icons/
2. Set fill to currentColor (or stroke to currentColor) in the svg so color inherits from the current text color
3. Add a ts re-export alongside it:

```ts
// packages/core/svg-icons/star.ts
export { default } from './star.svg'
```

4. Import and use it via the svg-icons alias, for example #/svg-icons/star.svg
