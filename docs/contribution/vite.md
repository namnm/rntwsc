<!-- START doctoc -->

- [Vite](#vite)
  - [Why not just reuse next-config](#why-not-just-reuse-next-config)
  - [Reusing the existing babel and svg loaders](#reusing-the-existing-babel-and-svg-loaders)
  - [Web variant resolution: resolver level, not babel, and mostly a fallback](#web-variant-resolution-resolver-level-not-babel-and-mostly-a-fallback)
    - [Consumers of a published rntwsc package via node_modules](#consumers-of-a-published-rntwsc-package-via-node_modules)
    - [optimizeDeps: what's excluded, included, and deduped](#optimizedeps-whats-excluded-included-and-deduped)
    - [Resolving rntwsc's own third-party runtime deps without a consumer declaring them](#resolving-rntwscs-own-third-party-runtime-deps-without-a-consumer-declaring-them)
  - [What playground/vite owns itself](#what-playgroundvite-owns-itself)
  - [Loading this file's own config from a raw-TypeScript published package](#loading-this-files-own-config-from-a-raw-typescript-published-package)
  - [.web.js resolution for third-party packages](#webjs-resolution-for-third-party-packages)

<!-- END doctoc -->

# Vite

playground/vite is a plain client-side SPA - no NextJS, no RSC, no server at all. It exists to prove the framework works outside NextJS, for consumers who just want a Tailwind and React Native Web component library in an ordinary Vite app. packages/devtools/vite-config/index.ts builds and returns the Vite config it needs. Its output is referred to as the "web" variant elsewhere in these docs (see web-variant.md) - named to match the wider React Native ecosystem's own `.web.js` convention, not "spa", so it reads as a sibling of "browser" (the NextJS browser/server split) rather than a synonym for it.

## Why not just reuse next-config

A Vite SPA has no server compilation target, so there is no isServer split to thread through the way next-config has to for webpack and Turbopack - every part of vite-config's output applies unconditionally, once. That is the only structural difference; the actual transform and resolution problems are the same ones next-config already solves, so vite-config reuses next-config's building blocks directly rather than reimplementing them.

## Reusing the existing babel and svg loaders

packages/devtools/babel-loader and packages/devtools/svg-loader are plain functions shaped like a webpack loader - `(this: LoaderThis<T>, source: string) => void`, calling `this.callback(err, code, map)` - already used by next-config for both webpack and Turbopack. Vite's transform hook is promise-based instead of callback-based, so packages/devtools/vite-config/webpack-loader-to-vite-plugin.ts wraps either loader function in a small generic adapter that resolves or rejects a promise from the same callback, rather than reimplementing the babel and SVGR wiring a third time.

The babel loader is called with `isServer: false` always - a Vite SPA is architecturally always the client half of what next-config's own `target: 'nextjs', isServer: false` pass already does (async hook stripping, browser validation, Tailwind class extraction), so the same babel-config pipeline runs unchanged.

## Web variant resolution: resolver level, not babel, and mostly a fallback

Like the browser variant, this project's ban on relative imports means a flat, globally computed alias map fully covers every real import. packages/devtools/variant-resolve-alias/index.ts generalizes the glob-path-to-alias logic that used to live only in next-config into a `variant`-parameterized `variantResolveAlias(alias, variant, files)`, shared by next-config (variant browser) and vite-config (variants browser, native, and web).

Rather than every module shipping a `foo.web.ts` that just re-exports its browser sibling, vite-config builds the alias map in priority order and lets later entries win: browser files first (so any module with a browser file but no web file resolves there automatically - see web-variant.md), then an explicit override list for any module that still needs to share a native file verbatim (currently empty - navigation and tw/components/without-class-name/link-untyped used to be the two entries here, sharing native's react-navigation stack, until that turned out to crash on web - see web-variant.md), then real web files last (i18n, navigation, link-untyped today). This keeps most modules free of a web file entirely.

vite-config passes the resulting map to Vite's `resolve.alias` as an array of `{ find: RegExp, replacement }` entries, not a plain object. @rollup/plugin-alias (which powers Vite's resolve.alias) has the same exact-vs-prefix matching footgun webpack does - see contribution/turbopack.md's dark-mode/dark-mode-config example - webpack's fix is a `$`-suffixed key, Rollup's is an anchored `^...$` RegExp find instead of a plain string.

`variantResolveAlias`'s map values are absolute file paths, not specifiers - Rolldown/Vite warns and risks duplicating a module when an alias replacement isn't absolute, whereas webpack and Turbopack re-resolve either form fine, so an absolute path is the one value safe for both next-config and vite-config to share.

### Consumers of a published rntwsc package via node_modules

playground/vite consumes rntwsc as a real installed package, a git tarball, same as playground/app and both NextJS playgrounds - not the tsconfig alias. build-dist precomputes the browser, native, and web variant maps once at pnpm dist time and writes them to dist/devtools/next-config/browser-variants.json and dist/devtools/vite-config/{native,web}-variants.json. vite-config imports the browser and web files directly and merges them in alongside the freshly globbed in-repo map; the native file is only consulted for whatever is in the (currently empty) shared-with-native override list above, not merged in wholesale.

Only the root package.json declares `rntwsc` as a dependency; the four playground package.json files (app, turbopack, webpack, vite) no longer do. This matters because pnpm can give the exact same rntwsc git commit two different physical directories under node_modules/.pnpm - its content hash also depends on each consumer's own resolved dependency graph, and two playgrounds with different dependency sets don't share one. A file resolved through one copy could stop matching esmDirs' rntwscRoot (computed once, from this file's own `__dirname`), causing babel-loader to wrongly CommonJS-transform it - the browser's native ESM loader has no interop for that, so a named import from it silently comes back "does not provide an export named ...". With only one package.json declaring rntwsc, there is only ever one physical copy anywhere in the repo, and Node's normal upward node_modules walk lands every consumer on it - no `resolve.dedupe` workaround needed for rntwsc itself. See contribution/build.md for the publish workflow this depends on (`pnpm dedupe` instead of `pnpm install` after bumping the pin).

### optimizeDeps: what's excluded, included, and deduped

`optimizeDeps.exclude` lists `rntwsc` itself (raw TS source, must go through babel-loader instead, see contribution/build.md) plus `react-native-reanimated` and `react-native-worklets` - both native-only and unloadable in a browser bundle; nothing on the web variant should ever import them. `optimizeDeps.include` force-prebundles `react`, `react-dom`, and rntwsc's own third-party runtime deps (see the next section) - without this, a package reached only through rntwsc's own excluded, babel-transformed source can land on a different prebundled instance than the one app code imports directly, and `react-dom`'s `createPortal` (used by several UI primitives) throws when the two instances don't match.

### Resolving rntwsc's own third-party runtime deps without a consumer declaring them

rntwsc's own source imports plain npm packages a consuming app never touches directly - color-rgba and js-cookie for theme/dark-mode, lodash-es and immer/use-immer for state helpers, json-stringify-safe and json-stable-stringify for cache keys, bezier-easing and react-native-css-animations for animation, tailwind-merge and twrnc for class merging, ulidx for ids. These still need to be resolvable and pre-bundled for Vite's optimizer, but a Vite consumer has no reason to declare them in its own package.json, and the optimizer resolves `optimizeDeps.include` entries from the consuming project's own root, not from inside rntwsc's installed location.

vite-config's `rntwscRuntimeDeps` lists these package names explicitly and resolves each one via a plain `require.resolve(name)` call made from inside vite-config/index.ts itself. Once this file is installed as part of the published rntwsc package, that call runs from inside `node_modules/rntwsc/devtools/vite-config`, which pnpm gives its own sibling node_modules populated from rntwsc's own dependencies (the same mechanism that lets any npm package resolve its own deps regardless of what the top-level project declares) - so `require.resolve('color-rgba')` finds rntwsc's own installed copy even when the consuming playground never listed it. The resolved absolute paths are added to `resolve.alias` (exact match, like the existing `react-native`/`react-native-svg` entries) so both normal imports and the optimizer's own resolver find them, and their names go into `optimizeDeps.include` alongside `react`/`react-dom`.

This only works for single-entry packages resolved by their bare name - a package needing deep-import support (`@apollo/client/cache`, `@apollo/client/errors`, and similar) would need a directory-prefix alias instead, which risks not honoring a package's own `exports` conditions correctly; `@apollo/client` and `graphql` are left as direct dependencies in playground/vite/package.json for this reason, not migrated into `rntwscRuntimeDeps`.

`resolve.dedupe: ['i18next', 'react-i18next']` covers a separate, narrower duplicate-instance risk: i18next is reached both directly by app code (normal optimized import) and internally by rntwsc's own babel-transformed source, and nothing else guarantees those two resolutions share a module instance. When they don't, `i18next.init()` runs on a different instance than the one app code reads `i18next.language` from, and react-i18next logs "make sure there is only one instance of react-i18next" or `useTranslation` never sees a ready instance.

## What playground/vite owns itself

playground/vite/vite.config.ts calls vite-config's config(), reusing playground/app/babel-plugin-tw-config.js verbatim (the same plain CJS glue file turbopack and webpack already share). Its Tailwind postcss pipeline stays in its own postcss.config.ts (same shape as turbopack/webpack's), picked up automatically - it is not declared inline in vite.config.ts.

Routing and app startup, unlike the other two web playgrounds, are not file-system based - there is no server to do file-based routing against. Unlike native, it is also not react-navigation-based - see web-variant.md for why that was abandoned. playground/app/src/app.web.tsx wraps everything in react-router's `<BrowserRouter>` and renders a small `PageRouter` component: it strips an optional leading `/:locale` segment off `useLocation().pathname` (mirroring what next/proxy.ts does for NextJS, but client-side and without a redirect), syncs i18next's language to that locale if present, then looks the remaining path up directly in routesNative (the same map native's own stack consumes) to pick which page component to render - no react-router `<Route>` tree at all, since routesNative is already a flat `{path: Component}` map and a direct lookup is simpler than reconstructing one. It awaits initI18nWeb() once before first render, same as app.native.tsx awaits initI18nNative(). Unlike native, it does not render `SafeAreaProvider` - a real browser reads safe-area insets straight from CSS `env(safe-area-inset-*)` (see packages/core/responsive/use-safe-area.browser.ts), no native measurement provider needed, and react-native-safe-area-context's own package has no browser entry point at all (see ".web.js resolution" below) - rendering its real provider pulls in a native spec file that crashes on web.

playground/vite/src/main.tsx imports `@/polyfill/web` before anything else (mirroring app.native.tsx's own `@/polyfill/native` import) - this is what actually calls `initI18n(locales, labels)` (via playground/app/src/polyfill/init-i18n.ts, reused unchanged) and sets up the twrnc/theme/minified-class-name polyfills; skipping it leaves i18next never initialized, so `i18next.changeLanguage` crashes reading properties off `languageUtils` the moment anything calls it.

## Loading this file's own config from a raw-TypeScript published package

Vite loads vite.config.ts itself via Node's native TS type-stripping, which refuses to strip types for anything under node_modules - a plain `import { config } from 'rntwsc/devtools/vite-config'` (raw .ts source, published as-is per contribution/build.md) fails for exactly that reason. playground/vite/vite.config.ts works around this the same way brekekephone/web/vite.config.ts does: `require('tsx/cjs')` registers a require() hook that transpiles TypeScript on the fly regardless of where the file lives, then everything reaching into rntwsc goes through `require(...)`, not `import`. This is the opposite of next.config.ts's own "must not import tsx, it will conflict with nextjs" warning - NextJS compiles its own config file through its own pipeline and does not have this restriction, so registering tsx's hook there conflicts instead of helping.

vite-config's own `esmDirs` option needs every directory of first-party source served raw by Vite's dev server, not just the consuming app's own src - playground/app/src (the shared `@/*` pages every playground reuses) is also served raw, not through the optimizer, so it needs to be listed too or babel compiles it to CJS with no interop layer, and named imports from it silently resolve to undefined at runtime with no build-time error.

## .web.js resolution for third-party packages

Separately from this repo's own `.web.ts(x)` variant convention above, a lot of the react-native-web ecosystem ships a `.web.js` file next to a package-internal file, relying on Metro/webpack's own platform-priority resolution (`foo.web.js` over `foo.js` for a web build) to pick it up - react-native-safe-area-context's NativeSafeAreaProvider.web.js is one example; its plain `.js` sibling calls `codegenNativeComponent` unconditionally, which crashes immediately on web. Vite has no built-in notion of this convention, so vite-config lists `.web.mjs`/`.web.js`/`.web.mts`/`.web.ts`/`.web.jsx`/`.web.tsx` first in both the main `resolve.extensions` and the dependency optimizer's own separate scanner resolver (`optimizeDeps.rolldownOptions.resolve.extensions` - the scanner has its own resolver, entirely separate from the main one, so it needs its own copy) - without both, some packages that rely on this convention silently get their native file instead on web.
