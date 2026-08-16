<!-- START doctoc -->

- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Running the playground](#running-the-playground)
  - [Building packages](#building-packages)
  - [Extracting theme CSS variables](#extracting-theme-css-variables)
  - [Extracting minified class names](#extracting-minified-class-names)
  - [Checking i18n labels](#checking-i18n-labels)
  - [Running unit tests](#running-unit-tests)
  - [Running e2e tests](#running-e2e-tests)
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

# Web (Vite) - plain client-side SPA, no NextJS, no server, see contribution/vite.md
cd playground/vite
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

## Extracting minified class names

```sh
pnpm extract
```

Pre-computes the tw-class -> minified-name mapping (playground/app/src/codegen/class-names.min.json) that `NEXT_PUBLIC_MINIFY_CLASS_NAMES=1` builds read from - see turbopack.md and the "build2"/"start2" scripts in playground/turbopack/package.json. This is the standalone, whole-repo pass (packages/devtools/babel-extract); the per-file babel-plugin-tw pass that runs during the real build only reads the mapping, it never assigns new minified names itself.

Scans the whole monorepo, not just playground/app, so packages/core's own tw`` usages (see packages/core/tw/lib/react-native-web.ts) get a minified entry too - otherwise they'd stay unminified in the final bundle. packages/devtools and packages/cli are excluded: they're build tooling never bundled into a real app, and packages/cli/extract-tw-class-names/traverse-call-expression.ts itself contains the literal source text `twFn.cva(calleeName)` / `twFn.clsx(calleeName)`, which the plugin's own name-based heuristic would otherwise misidentify as a real call to transpile.

Run this after adding a new tw class name anywhere in scope; it also runs automatically as part of pnpm fmt.

## Checking i18n labels

```sh
pnpm check-i18n-labels
```

Scans playground/app/src for `useTranslationUntyped`/`t(...)` usage and cross-checks it against the `en` locale's label files (playground/app/src/i18n/labels/en/\*.json), reporting keys referenced in code but missing from labels (fatal) and label keys never referenced (warning only). The unused-key check is static analysis, so a key only ever referenced through a dynamic/variable argument (for example `t(someVariable)` instead of `t('literal-key')`) is reported as unused even though it is genuinely used - a known, accepted limitation, not a bug.

## Running unit tests

```sh
pnpm test
```

vitest.config.ts and vitest.setup.ts recreate several things a real build or a real Next.js/React Native runtime normally provides, since tests never go through the actual bundler or a real framework request cycle.

Browser variant aliasing mirrors packages/devtools/next-config's browserResolveAlias, rewriting `#/core/<mod>` imports to their `index.browser` sibling (see docs/async-components.md's "Four boundaries") so importing an async framework hook (useIsRtl, useCurrentTheme, ...) does not pull in the RSC-only implementation, which imports next/headers and needs a real Next.js request. Each alias `find` is a RegExp anchored with `$` rather than a plain string, since a string alias also matches as a prefix (`#/core/i18n` would incorrectly also match `#/core/i18n/use-is-rtl`).

The SVG mock plugin redirects `.svg` imports to tests/mocks/svg.tsx via a resolveId hook rather than a resolve.alias regex, since @rollup/plugin-alias treats a RegExp `find`'s replacement as a String.replace() pattern (supporting $1 backreferences), which would garble the path here.

The async hook transform plugin runs the real packages/devtools/babel-plugin-async-hook transform (the one next-config/metro-config apply at build time) with `isServer: false` against source under packages/core/components and packages/core/tw/components, matching a real hydrated/client-rendered component. Without it, a component with a top-level `await use...()` (Button, TextInput, Select, Text, ...) stays a literal async function, which react-dom's createRoot (what @testing-library/react uses) cannot render - "Only Server Components can be async". See docs/hydration.md and babel-plugin-async-hook/index.ts's own comment above injectDehydrateJsx.

The transform is scoped to those two component directories only and skips .test.ts(x) files. Some non-component code (for example packages/core/graphql/codegen/hook.ts) names a plain callback option with a `use` prefix on purpose so asyncHookPlugin strips it for the browser bundle (see OperationHooksConfig's comment in utils.ts); stripping it in tests too would break packages/core/graphql/codegen/hook.test.ts, which calls that code directly and expects the real Node-environment behavior. Test files themselves often call hook-shaped mocked functions inside a plain anonymous test callback, which asyncHookPlugin's isValidHostName rule correctly rejects outside a real component/hook.

tests/mocks/next-unchecked-headers.ts and tests/mocks/next-unchecked-navigation.ts stand in for next-unchecked/headers and next-unchecked/navigation (see packages/core/next/unchecked/*.ts), since the real next/headers and next/navigation APIs need a live Next.js request/router context unit tests never have.

vitest.setup.ts imports packages/core/tw/polyfill/react-native-web directly for its side effects, since tests never mount ReactNativeWebEnhancer (see packages/core/tw/polyfill/react-native-web-enhancer.ts), which normally wires it up. Without it, the patched react-native-web cannot resolve a className off global/window and every component throws ("f is not a function").

vitest.setup.ts also calls cleanup() in afterEach, since @testing-library/react's auto-cleanup only activates when it detects Jest's global afterEach, and vitest.config.ts does not enable test.globals.

## Running e2e tests

```sh
pnpm e2e
```

playwright.config.ts builds and serves playground/turbopack, playground/webpack, and playground/vite against real production builds - `next build` plus the `output: 'standalone'` server (not `next start`, which NextJS itself warns is wrong for a standalone build, and not `next dev`, despite what each playground's own "start" script name suggests) for the two NextJS playgrounds, `vite build` plus `vite preview` for playground/vite - then runs against all three as separate projects (`--project=turbopack`/`--project=webpack`/`--project=vite` to run just one). The standalone output does not include `static/` or `public/` by default, so each webServer command copies them in before starting the server. playground/webpack has no src of its own - the webServer command runs `pnpm copy` first to sync it from playground/turbopack/src (see "Workspace layout" below), so a webpack-only run always tests current pages, not stale ones.

turbopack and webpack share e2e/routes.spec.ts, e2e/hydration-data.spec.ts, and e2e/client-nav.spec.ts; vite runs its own e2e/routes-vite.spec.ts instead (`testMatch`/`testIgnore` per project) - a plain client SPA has no SSR dehydration for hydration-data.spec.ts or client-nav.spec.ts to check.

e2e/routes.ts (the shared route list every routes*.spec.ts file loops over) is a relative import of playground/app/src/pages/route-paths.ts, not a hand-kept duplicate - adding a page to route-paths.ts is enough, no e2e file needs editing. A `@/` alias import would be more consistent with the rest of the repo, but Playwright's transform does not resolve it; route-paths.ts has no imports of its own, so a plain relative import works without needing that setup.

e2e/routes.spec.ts and routes-vite.spec.ts only ever reach a route via `page.goto()` - a fresh SSR load (or fresh client boot on vite) with its own dehydration payload if any. e2e/client-nav.spec.ts covers the other path: starting on `/` and clicking into `/fetch` then `/graphql` via real client-side navigation (Next.js App Router's own link interception, no full reload) - since neither page has a fresh SSR response of its own to hydrate from when reached this way, this is a distinct code path from a direct load, and the one issue 6 (dehydration key collision) was originally found on.

## Workspace layout

```
packages/core         framework source
packages/devtools     build tooling: babel, eslint, next-config, metro-config..
playground/app        React Native app plus shared pages
playground/turbopack  Next.js app, primary source, runs with the turbopack flag, faster, default choice
playground/webpack    Next.js app, a copy of turbopack's src, runs with the webpack flag
playground/vite       plain client-side SPA (Vite), no NextJS, no server
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

4. Import and use it via the svg-icons alias, for example @/svg-icons/star.svg
