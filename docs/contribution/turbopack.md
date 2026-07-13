# Turbopack

Turbopack is available as an additional, selectable bundler alongside webpack, for both next dev and next build. playground/turbopack runs Next with the turbopack flag, playground/webpack runs a copy of the same source (kept in sync via pnpm copy) with the webpack flag instead. packages/devtools/next-config/index.ts builds and returns configuration for both bundlers unconditionally, and Next picks whichever applies based on the flag used.

Turbopack is faster and should be used by default (playground/turbopack). Keep playground/webpack around for checking webpack-specific behavior, not as the everyday choice.

## Why this needed more than a config toggle

Two things this project depends on that Next's default pipeline does not support the same way across both bundlers:

1. A custom babel transform (Tailwind class name compilation, async component to sync rewriting, RSC boundary validation, react-compiler) that must run per file, gated on whether that file is being compiled for the server or for the client.
2. Resolving foo.browser.ts as an alternate implementation of foo.ts, only when compiling for the client - similar to Metro's native, ios, and android resolution, but for a browser bundle target Metro has no concept of.

## A custom loader instead of Next's own babel-loader

Next's own babel invocation only ever passes a caller object with a few fields Next itself controls, chiefly isServer - and under Turbopack that field is never set at all. Rather than depend on it, next-config registers its own transform directly, both as a webpack module rule and as a Turbopack rule, pointed at the same loader: packages/devtools/next-config/ts-loader.js, which requires the tsx runtime and re-exports the real implementation in packages/devtools/babel-config/loader.ts.

Both bundlers pass isServer to this loader explicitly, as a loader option, instead of relying on babel's caller mechanism:

- Webpack's own webpack(config, isServer) callback runs once per compilation target, server and client separately, so each target gets its own rule options with the correct isServer value baked in.
- Turbopack has no equivalent per-target callback, so two variants of the same rule are registered instead, each gated on Turbopack's own browser resolve condition - one for isServer true, one for isServer false - and only the matching variant applies to a given module.

Inside the loader, packages/devtools/babel-config/index.ts builds the actual plugin list, browser validation, the async hook plugin, the Tailwind plugin, and react-compiler for client code only, as a single babel pass. There is no second babel invocation anywhere in this pipeline.

isServer is threaded straight through as a plain option, not read from babel's caller at all: the loader passes it into babel-config's config(), which passes it into each plugin's own options object ([browserValidationPlugin, { isServer }], and the same for the async hook plugin). Each plugin then just reads pluginPass.opts.isServer directly. Babel's caller mechanism, which is what made isServer unreliable under Turbopack in the first place, is not part of this path at all anymore.

## Module format: turbopack app is ESM, webpack app is CommonJS

playground/turbopack's package.json declares type module, and its next.config.ts reads its own directory via import.meta.dirname, an ESM-only global. playground/webpack's package.json declares type commonjs instead, and its next.config.ts reads the same value via dirname, a CommonJS-only global.

This also changes what each playground passes as esmDirs to next-config's config(): turbopack passes its own directory (so babel-config/loader.ts skips adding the CommonJS transform plugin for files under it, since they are genuinely ESM already), while webpack passes an empty list (so every file, including its own next.config.ts-adjacent source, still gets transformed to CommonJS, matching its own package.json type).

## Browser variant resolution: resolver level, not babel

This project bans relative imports entirely via ESLint - every import goes through the at-sign or hash alias convention. That means a flat, globally computed alias map fully covers every real import in the codebase; there is no per-issuer or relative-import case left to handle.

packages/devtools/next-config/browser-resolve-alias.ts builds this map once, at config load time: for every browser.ts or browser.tsx file found by glob, it reverses the absolute path back into its alias form and produces a flat record, for example mapping the core foo alias to the core foo.browser alias (handling both the plain file form and the index.browser directory form).

- Webpack: merged into the client only resolve.alias, with a trailing dollar sign appended to every key so webpack matches the exact specifier instead of treating it as a path prefix. Without the dollar sign, resolving something like the dark-mode config submodule would incorrectly match the shorter dark-mode alias and get redirected into dark-mode's index.browser folder.
- Turbopack: wrapped as a browser resolve condition in resolveAlias, which only redirects the browser build target - server and RSC resolution are left untouched.

### Consumers of a published @rntwsc package via node_modules

playground/app and both Next.js playgrounds consume @rntwsc/core as a real installed package, a git tarball, not the tsconfig alias. Since the published package's own source is still raw ts and tsx (see build.md - build-dist never compiles anything), it needs a browser variant map too, but next-config cannot afford to glob into node_modules on every request. Instead, build-dist precomputes this map once at pnpm dist time and writes it to dist/devtools/next-config/browser-variants.json. next-config imports that file directly and merges it in alongside the freshly globbed in-repo map.

## CSS variable extraction

packages/core/themes ships some stylesheets suffixed extract-variables.css or extract-variables.scss. packages/devtools/css-extract-variables reads each one, compiles it if it is scss, and writes a local.json sibling containing just its CSS custom properties as a plain object - theme code imports that json directly. Since both bundlers resolve a plain json import natively, no bundler-specific loader is needed for this step at all. Run pnpm css-extract-variables after changing one of these files (see dev.md); it also runs automatically as part of pnpm dist.

## SVG handling under Turbopack

turbopack.rules for svg files uses the same svgr webpack loader and options as the webpack rule (dimensions turned off), following Turbopack's documented loader array syntax.

## RSC boundary validation and the next-unchecked wrapper

next/headers and similar RSC-only modules are blocked from browser bundles by packages/devtools/babel-plugin-browser-validation, which throws a build error if a matching import shows up in a file compiled for the client. Framework code that reads a cookie or header (dark-mode, theme, navigation, i18n) does so through a next-unchecked namespace instead (for example next-unchecked headers), which resolveAlias in next-config maps to the framework's own wrapper module. Each of these files only exists in the default, server-only variant - every place that needs the same data on the client has its own browser sibling built on client-safe primitives instead, so the next-unchecked import is never actually reached while compiling for the client in the first place.

## What ships to consumers

build-dist ships the framework's raw ts, tsx, js, svg, css, and scss source as is - no type stripping, no CommonJS conversion, no tsc compile step. See build.md for the module and export map details. transpilePackages in next-config, together with the at-rntwsc special case in should-transpile, is what lets both bundlers run their normal first-party pipeline against this raw source even though it lives inside node_modules.
