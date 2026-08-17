<!-- START doctoc -->

- [todo](#todo)
  - [1. Controlled TextInput silently drops keystrokes before hydration finishes](#1-controlled-textinput-silently-drops-keystrokes-before-hydration-finishes)
  - [2. Select does not forward arbitrary props (e.g. testID)](#2-select-does-not-forward-arbitrary-props-eg-testid)
  - [3. DataGrid renders every row twice (desktop + mobile layout)](#3-datagrid-renders-every-row-twice-desktop--mobile-layout)
  - [4. Two next-config dev instances on different ports share one Turbopack cache dir](#4-two-next-config-dev-instances-on-different-ports-share-one-turbopack-cache-dir)
  - [5. No documented "when is it safe to interact" contract for hydration](#5-no-documented-when-is-it-safe-to-interact-contract-for-hydration)
  - [6. Dehydration key collision between server and async client components](#6-dehydration-key-collision-between-server-and-async-client-components)
  - [7. extract-tw-class-names had never actually been run](#7-extract-tw-class-names-had-never-actually-been-run)
  - [8. rntwsc version pin duplicated across 5 package.json files](#8-rntwsc-version-pin-duplicated-across-5-packagejson-files)
  - [9. e2e suite only ran against playground/turbopack](#9-e2e-suite-only-ran-against-playgroundturbopack)
  - [10. playground/vite did not start at all](#10-playgroundvite-did-not-start-at-all)
  - [11. Full app (@/app) crashed on playground/vite](#11-full-app-app-crashed-on-playgroundvite)
  - [12. playground/app/src/polyfill/spa.ts and packages/core/i18n/index.spa.tsx renamed to *.web](#12-playgroundappsrcpolyfillspats-and-packagescorei18nindexspatsx-renamed-to-web)
  - [13. No e2e coverage for playground/vite at all](#13-no-e2e-coverage-for-playgroundvite-at-all)
  - [14. Dropped react-navigation for playground/vite, uses react-router instead](#14-dropped-react-navigation-for-playgroundvite-uses-react-router-instead)
  - [15. create-rntwsc-app scaffolding package](#15-create-rntwsc-app-scaffolding-package)
  - [16. Native fetch/graphql are stub re-exports of the browser variant](#16-native-fetchgraphql-are-stub-re-exports-of-the-browser-variant)
  - [17. useFetch does not cancel a pending request](#17-usefetch-does-not-cancel-a-pending-request)
  - [18. Apollo auto-refetch does not clear hydrationErr](#18-apollo-auto-refetch-does-not-clear-hydrationerr)
  - [19. create-rntwsc-app: broken native nav, no default rntwsc pin, no verification](#19-create-rntwsc-app-broken-native-nav-no-default-rntwsc-pin-no-verification)
  - [20. e2e route list was hand-duplicated, no client-nav coverage](#20-e2e-route-list-was-hand-duplicated-no-client-nav-coverage)
  - [21. Tried defaulting keySalt automatically per variant - does not work](#21-tried-defaulting-keysalt-automatically-per-variant---does-not-work)
  - [22. Made dedupe opt-in instead of always-on, default now collision-safe](#22-made-dedupe-opt-in-instead-of-always-on-default-now-collision-safe)
  - [23. create-rntwsc-app's generated project has no way to run extract-tw-class-names or check-i18n-labels](#23-create-rntwsc-apps-generated-project-has-no-way-to-run-extract-tw-class-names-or-check-i18n-labels)
  - [24. i18n label validation silently skips dynamic keys - no unused/missing signal for them](#24-i18n-label-validation-silently-skips-dynamic-keys---no-unusedmissing-signal-for-them)
  - [25. i18n loads every language's labels into one bundle, no per-language async loading](#25-i18n-loads-every-languages-labels-into-one-bundle-no-per-language-async-loading)
  - [26. Fill out the component set: Toast, Tabs, Tooltip, Avatar, Progress/Slider, Combobox](#26-fill-out-the-component-set-toast-tabs-tooltip-avatar-progressslider-combobox)
  - [27. Auth/session and authz (roles, orgs, permissions) built-ins](#27-authsession-and-authz-roles-orgs-permissions-built-ins)
  - [28. Cross-platform file/media picker (camera roll, take photo, crop)](#28-cross-platform-filemedia-picker-camera-roll-take-photo-crop)
  - [29. Built-in common native functionality (push notifications first)](#29-built-in-common-native-functionality-push-notifications-first)
  - [30. create-rntwsc-app: flags to pick which features land in the generated project](#30-create-rntwsc-app-flags-to-pick-which-features-land-in-the-generated-project)
  - [31. Pre-built page/component sets for common app shapes (dashboard, storefront, blog)](#31-pre-built-pagecomponent-sets-for-common-app-shapes-dashboard-storefront-blog)
  - [32. Component set gaps remaining after issue 26](#32-component-set-gaps-remaining-after-issue-26)
  - [33. twStableProvider should accept an array of selector categories, not just a boolean](#33-twstableprovider-should-accept-an-array-of-selector-categories-not-just-a-boolean)
  - [34. GraphQL-specific auto-loading layer for Combobox (operation name in, results out)](#34-graphql-specific-auto-loading-layer-for-combobox-operation-name-in-results-out)

<!-- END doctoc -->

# todo

Issues found while building and e2e-testing an app on rntwsc (repo: suite).
Each one is something I actually hit, not theoretical - repro notes included
where useful.

## 1. Controlled TextInput silently drops keystrokes before hydration finishes

STATUS: not fixed - documented instead (see issue 5). This is a general React
SSR-hydration timing gap, not a bug isolated to one component: event handlers
for any Client Component only attach once hydration reaches that part of the
tree, and for a controlled input specifically, once hydration mounts React
syncs the DOM back to whatever `value` state still is - silently discarding
anything typed in the gap. Both suggestions below (a readiness signal, or
input event buffering/replay) are real architectural features - not
something to bolt onto TextInput as a quick patch without live browser/
Playwright verification. Flagging for a deliberate design pass rather than
guessing at an implementation overnight.

Typing into a TextInput right after `page.goto()` resolves (Playwright) does
nothing - no error, the value just stays empty. Confirmed by hand: same
input, same script, worked fine once a short delay (or waiting past
`networkidle`) was added before the first keystroke, and failed consistently
without it. Repro was the plain login form (email field, type="email"),
nothing exotic about the component setup.

This is not just a testing inconvenience - a real user typing fast right
after the page paints (before hydration attaches the input's onChange
handler) would lose those keystrokes too, silently.

Suggestion: expose some hydration-ready signal (a ref method, a custom
event, a data attribute) so consumers know when it's safe to interact, or
better, queue/replay input events that arrive before hydration instead of
dropping them.

## 2. Select does not forward arbitrary props (e.g. testID)

STATUS: fixed. `SelectProps` now includes `Omit<PressableProps, 'className'
| 'disabled' | 'onPress' | 'children'>`, and the component destructures
`...rest` and spreads it onto the trigger `Pressable` (same pattern Button
already uses). `testID`, `accessibilityLabel`, and any other Pressable prop
now reach the trigger. `tsc` and the existing test suite (261 tests) pass.

`components/select`'s props are destructured against a closed list
(`multiple, appearance, size, shape, disabled, items, placeholder, ...`) with
no `...rest` spread, so there is no way to attach `testID`,
`accessibilityLabel`, or any other custom prop to it. TextInput/Button do not
have this problem (they spread the rest of their props through).

Suggestion: spread the remaining props onto the trigger Pressable/Input.

## 3. DataGrid renders every row twice (desktop + mobile layout)

STATUS: cannot fix here. There is no `DataGrid` component anywhere in this
repo (`packages/core/components/` has no data-grid/datagrid entry, confirmed
via a repo-wide search). This must be a component the "suite" app itself
built, not something rntwsc ships - the fix belongs in that repo, not here.

One layout is hidden via CSS, but both are present in the DOM. Any
text-based query (Playwright locator, browser "find in page", a testing
library) matches 2 elements per row instead of 1, and the duplicate markup
ships in the SSR/hydration payload even though only one variant is ever
shown.

Suggestion: either drive both layouts from one DOM tree via responsive
classes instead of duplicating markup, or document the duplication clearly
so consumers know `getByText(...)` etc will need `.first()`/`.last()`/a
custom "visible" filter around a row match.

## 4. Two next-config dev instances on different ports share one Turbopack cache dir

STATUS: fixed. `next-config`'s `Options` type now has an optional `distDir?:
string`, passed straight through into the returned `NextConfig` when set.
No more need for the ad hoc `.then(c => ({ ...c, distDir: ... }))` wrapper -
just pass `distDir` directly to `config(...)`. (Next.js's own type
declarations confirm distDir is exactly the mechanism meant for this: it
acquires a lockfile scoped to that dir specifically to prevent multiple
processes colliding on one build output.)

`devtools/next-config`'s `config()` does not expose a `distDir`/cache-dir
option. Running `next dev --turbopack` twice against the same source tree on
two different ports (e.g. a manual dev server plus an isolated one for e2e
tests) still points both at the same `web/.next/dev` Turbopack persistent
cache by default - confirmed this deadlocks the second instance
indefinitely on its very first request (it logs "Ready", accepts the TCP
connection, then never responds).

Workaround used: wrap `config(...)` with `.then(c => ({ ...c, distDir:
process.env.E2E_DIST_DIR }))` in the consuming app's next.config.ts, since
`config()` returns a Promise.

Suggestion: accept `distDir` directly in `config()`'s `Options` type so this
does not need an ad hoc wrapper per app.

## 5. No documented "when is it safe to interact" contract for hydration

STATUS: fixed. Added a "When is a component actually interactive?" section
to docs/hydration.md explaining the hydration gap, why it hits controlled
inputs specifically, that there is no readiness signal today, and practical
guidance for e2e tests (wait past networkidle / add a delay before the first
interaction). This is also the documentation half of issue 1 above.

docs/async-components.md documents what the async-server-component to
sync-client-component transpile does, but not, from a consumer's
perspective, when a component is actually interactive after hydration -
which is exactly what issue 1 above runs into. Worth a short note in the
hydration docs, even just "wait for X" or "there is no signal for this
today, use a manual delay in tests".

## 6. Dehydration key collision between server and async client components

STATUS: fixed. Added `keySalt` to `UseApollo` (packages/core/graphql/config.ts)
and `UseFetch` (packages/core/fetch/config.ts) - an optional string folded
into the hydration key only, never sent in the actual request. GraphQLClient
(playground/app/src/pages/graphql/graphql-client.tsx) now passes
`keySalt: 'client'`. Regression tests added: packages/core/hydration/config.test.ts,
packages/core/graphql/config.test.ts, packages/core/fetch/config.test.ts,
a new case in packages/core/graphql/codegen/hook.test.ts, and two new e2e
tests (e2e/hydration-data.spec.ts) asserting real rendered data on /graphql
and /fetch, not just "no console error". Docs updated: docs/hydration.md
("Multiple renderers of the same call: keySalt") and
docs/contribution/hydration.md ("Dehydration key collisions and keySalt"),
which also corrects a now-inaccurate claim that only the server hook ever
produces a dehydrated template - an async `'use client'` component does too.

/graphql had a consistently-reproducible transient hydration mismatch
(React error #418) in production builds only (never in `next dev`).
GraphQLServer and GraphQLClient both called useFetchHello with identical
url/query/variables, so they resolved to the exact same hydration key -
DehydrateTemplate's dedup-by-key logic then emitted only one `<template>`
marker for both, attached to whichever instance rendered first on the
server. The other group hydrated at a different point in Next's RSC stream
(GraphQLClient is an async `'use client'` component, split by
babel-plugin-async-hook), and could race past the point where that one
shared marker's data had streamed in. rntwsc/fetch's playground demo had
already avoided the same collision by giving the client instance a
different real url (`?client=true` suffix) - keySalt generalizes that fix
to calls where the url is not actually different (GraphQL in particular).

## 7. extract-tw-class-names had never actually been run

STATUS: fixed. Wired into packages/cli/devtools/index.ts (`pnpm extract`) and
packages/cli/check-i18n-labels similarly (`pnpm check-i18n-labels`, was also
wired nowhere). Fixed 3 real bugs in packages/devtools/babel-extract/index.ts
found only by actually running it (tsc and existing unit tests stayed green
throughout): an always-empty `pluginPass.opts` that failed schema validation
before scanning a single file; `.test.ts(x)` files breaking the scan (a
valid-at-runtime shape like `clsx('a', false)` isn't statically transpilable);
and the whole-repo scan matching its own tooling source, since
`twFn.cva(calleeName)` inside babel-plugin-tw's own implementation
name-collides with the cva/clsx detection heuristic. Added an `ignore`
option to `extract()` and regression tests for all 3
(packages/devtools/babel-extract/index.test.ts) plus docs
(docs/contribution/dev.md's "Extracting minified class names" and "Checking
i18n labels" sections, previously undocumented).

Suggestion for next time a devtools task is added: tsc passing and unit
tests passing are not evidence a task actually runs - vitest's module
resolution is more lenient than plain Node's (a separate real bug,
`@babel/plugin-syntax-typescript` missing as a resolvable dependency, only
surfaced via an actual `node ./devtools check-i18n-labels` run, not its
unit tests). Run new devtools tasks for real before considering them done.

## 8. rntwsc version pin duplicated across 5 package.json files

STATUS: fixed, differently than the original suggestion below. Rather than
syncing or validating 5 separate pins, removed 4 of them: only root
package.json declares `rntwsc` as a dependency now. playground/app,
playground/turbopack, playground/webpack, and playground/vite no longer
declare it at all, and resolve it via Node's normal upward node_modules
walk up to root's single copy - see contribution/vite.md's "Consumers of a
published rntwsc package" and contribution/build.md. This also fixed an
unrelated bug the old 5-copy setup could hit: pnpm can give the same
rntwsc commit two different physical directories under node_modules/.pnpm
when consumers have different resolved dependency graphs, which broke
vite-config's own module resolution.

Since only one file has the pin, `make publish`'s workflow is now: bump
`dist.version`, `pnpm dist`, `make publish`, paste the new SHA into root
package.json only, `pnpm dedupe` (not `pnpm install`, since only root
changed). The original suggestion (a devtools task syncing or validating
multiple pins) is moot now that there is only one.

## 9. e2e suite only ran against playground/turbopack

STATUS: fixed. playwright.config.ts now defines two projects (`turbopack`,
`webpack`), each with its own webServer entry building and serving that
playground's real production build - webpack's build syncs
playground/webpack/src from playground/turbopack/src via `pnpm copy` first
(see docs/contribution/dev.md's "Running e2e tests"), since webpack has no
source of its own. `pnpm e2e` now runs the full suite against both bundlers
(64 tests total, was 30); `--project=webpack` or `--project=turbopack` runs
just one.

## 10. playground/vite did not start at all

STATUS: fixed for a minimal hello-world entry (src/main.tsx); the full
@/app (navigation/i18n/SafeAreaProvider) still fails - see issue 11.
playground/vite/vite.config.ts was a bespoke ~345-line reimplementation
that duplicated packages/devtools/vite-config/index.ts's logic by hand
instead of calling it, contradicting docs/contribution/vite.md's own
description of the intended architecture ("playground/vite/vite.config.ts
calls vite-config's config()"). Rewrote it to actually call `config()`,
fixing 4 real bugs found only by actually running `pnpm start` (tsc has no
way to catch any of these, they are all runtime/config-loading issues):

- Vite loads vite.config.ts via Node's native TS type-stripping, which
  refuses to strip types under node_modules - a plain `import { config }
from 'rntwsc/devtools/vite-config'` (raw .ts source, published as-is)
  failed for exactly that reason. Fixed by using the `require('tsx/cjs')`
  CJS-require-hook trick instead (matching brekekephone/web/vite.config.ts,
  and the opposite of what next.config.ts's own "must not import tsx, it
  will conflict with nextjs" comment warns against).
- vite-config's `esmDirs` option only included this playground's own
  src by default - playground/app/src (the shared @/* pages) is also
  served raw by Vite's dev server, not through the optimizer, so it also
  needs to stay ESM or babel compiles it to CJS with no interop layer,
  and every named import from it silently resolves to undefined at
  runtime. Fixed in playground/vite/vite.config.ts by adding
  playground/app to esmDirs too.
- vite-config's `optimizeDeps.include` only ever added rntwsc's own real
  `dependencies` - react/react-dom are always peers, never listed there,
  but rntwsc's own source imports named exports directly off them (e.g.
  components/portal/container.tsx's `import { createPortal } from
'react-dom'`) - without forcing them into the optimizer too, that
  specific import id never got the same interop 'react-dom/client'
  (reached separately) already got, and the named export came back
  undefined. Fixed by adding react/react-dom to vite-config's own include
  list.
- vite-config's optimizeDeps.exclude was missing react-native-reanimated
  and react-native-worklets (genuinely native-only, referenced by
  @react-navigation/native-stack regardless of platform) - the old bespoke
  vite.config.ts already excluded these for exactly this reason, the
  rewrite had dropped it. Fixed by adding both back to vite-config's own
  exclude list.
- vite-config's null.ts stub (used for react-native-only APIs
  react-native-web has no equivalent for, e.g. codegenNativeComponent)
  exported a plain object - fine for a reference that's only ever read,
  but react-native-safe-area-context's own NativeSafeAreaProvider.js calls
  `codegenNativeComponent('RNCSafeAreaProvider')` unconditionally at
  module top level, so `{}` not being callable is a hard crash the instant
  that module loads, regardless of platform. Fixed by making the stub's
  default export a no-op function instead.

Republished 4 times to actually verify each fix (`pnpm dist` + `make
publish` + rebump all 5 package.json pins - playground/vite makes 5 total
now, see issue 8 - + `pnpm install`, each time) - see
docs/contribution/build.md.

## 11. Full app (@/app) crashed on playground/vite

STATUS: fixed. main.tsx now renders @/app for real (not the issue 10
hello-world page anymore) and every route passes e2e/routes-vite.spec.ts
(issue 13) for real, no `test.fail()` needed anymore. The 3rd bug below
turned out to need dropping react-navigation for this variant entirely -
see issue 14.

- Fixed: SafeAreaProvider crashed with "Element type is invalid ... got:
  null". Root cause was not a missing alias - react-native-safe-area-context
  ships a proper `NativeSafeAreaProvider.web.js` right next to the `.js`
  file that calls codegenNativeComponent unconditionally, following the
  standard Metro/webpack "prefer `foo.web.js` over `foo.js`" convention -
  but Vite has no built-in notion of that convention, and vite-config's
  `resolve.extensions` never listed `.web.js` (or any `.web.*`) at all, so
  every package relying on it silently got its native file. Fixed by
  adding `.web.mjs/.web.js/.web.mts/.web.ts/.web.jsx/.web.tsx` to the front
  of both vite-config's main `resolve.extensions` and the dependency
  optimizer's own separate scanner resolver
  (`optimizeDeps.rolldownOptions.resolve.extensions` - a genuinely separate
  resolver, needs its own copy). Separately, also removed app.web.tsx's own
  `<SafeAreaProvider>` - unnecessary even once the crash was fixed, since
  web reads safe-area insets from CSS `env(safe-area-inset-*)`
  (responsive/use-safe-area.browser.ts), no provider needed at all.
- Fixed: i18next logged "You will need to pass in an i18next instance ...
  make sure there is only one instance of react-i18next", then crashed
  inside changeLanguage reading `languageUtils` off undefined. Not a
  duplicate-module-instance bug as first suspected - playground/vite/src/
  main.tsx simply never imported `@/polyfill/web` (playground/app/src/
  polyfill/web.ts, renamed from spa.ts - see issue 12), the one thing that
  actually calls `initI18n(locales, labels)` - so i18next's `.init()`
  legitimately never ran. app.native.tsx imports `@/polyfill/native` for
  the exact same reason; app.web.tsx has no equivalent of its own to import
  from since it's not itself the platform entry point. Fixed by adding the
  import to main.tsx. Also added `resolve.dedupe: ['i18next',
'react-i18next']` to vite-config while investigating, on general
  principle (matches react-i18next's own suggested fix for this class of
  warning) - kept even though it turned out not to be this bug's actual
  cause.
- Fixed (see issue 14 for the full writeup): once both of the above were
  fixed, a new, different crash surfaced on every single route - "Failed to
  set an indexed property [0] on 'CSSStyleDeclaration': Indexed property
  setter is not supported", inside React DOM's setValueForStyle/
  setValueForStyles while completing a plain `<div>`, before any page
  content ever renders. Isolated (by temporarily swapping app.web.tsx's
  real `<Navigation>` for a static placeholder, which made the crash
  disappear) to @react-navigation/native-stack's own rendering, not app
  code and not any individual page - a `style` prop shaped as a plain
  array (React Native's own `style={[a, b]}` convention) is reaching a raw
  DOM element directly, unflattened, somewhere inside native-stack/
  react-navigation-native's own internals. `enableScreens(false)`
  (react-native-screens' own opt-out) did not fix it. Swapping
  @react-navigation/native-stack for @react-navigation/stack (its own
  JS-based alternative, no native-only modules needed) did not fix it
  either - the exact same error, confirmed via the same isolation
  technique to still come from react-navigation's own rendering, just not
  the specific navigator. Concluded the bug is in something shared by both
  (@react-navigation/native's NavigationContainer/createStaticNavigation,
  or react-native-screens/react-native-safe-area-context used internally
  by either navigator) rather than a navigator-specific implementation
  detail - not bisected further, since react-router turned out to fully
  solve it by removing react-navigation from this variant entirely.

## 12. playground/app/src/polyfill/spa.ts and packages/core/i18n/index.spa.tsx renamed to *.web

STATUS: fixed - a plain rename, done together with renaming the whole
"spa" variant to "web" throughout (vite-config, variant-resolve-alias,
no-import-invalid-variant's variant list, docs/spa-variant.md ->
docs/web-variant.md, and every doc/comment that named the variant). Purely
to match the wider React Native ecosystem's own `.web.js` convention (see
issue 11's first fix) - "browser" still means the NextJS browser/server
split, "web" now specifically means this variant (a plain Vite SPA, no
server). Also fixed a real doc inaccuracy caught while rewriting
web-variant.md: it claimed neither no-missing-export nor
no-import-invalid-variant "know about spa at all" - true for the former,
false for the latter (`'spa'`/now `'web'` was always a real entry in its
own variant list, with the same missing-base-file enforcement browser/
native get). Republished and rebumped all 5 pins (playground/vite makes 5,
not 4 - see issue 8) to verify; full e2e suite (64 tests, both bundlers)
and the hello-world smoke test (issue 10) still pass after the rename.

## 13. No e2e coverage for playground/vite at all

STATUS: fixed. playwright.config.ts adds a third project (`vite`), served
by `vite build` + `vite preview` (Vite's own equivalent of the standalone
server the other two projects use - not `vite`'s dev server). It runs its
own e2e/routes-vite.spec.ts instead of sharing routes.spec.ts/
hydration-data.spec.ts with the NextJS playgrounds (`testMatch`/
`testIgnore` per project) - there is no SSR dehydration on a plain client
SPA for hydration-data.spec.ts to check, and routes.spec.ts's
knownFailingRoutes mechanism assumes route-specific failures, not the
project-wide one every route shared at the time (issue 11's 3rd bug) -
routes-vite.spec.ts originally wrapped every route in `test.fail()` for
exactly that reason, so the suite stayed green (86 tests: 64 real + 22
tracked known-failing) while staying honest. That bug is now fixed (issue
14), so `test.fail()` came back out - all 86 are real passes now.

## 14. Dropped react-navigation for playground/vite, uses react-router instead

STATUS: fixed. See issue 11's 3rd bullet for how this was diagnosed - the
same "style array reaches a raw DOM element unflattened" crash happened
identically with both @react-navigation/native-stack and
@react-navigation/stack, isolated (by swapping the real `<Navigation>` for
a placeholder each time) to react-navigation's own shared rendering both
times, not a specific navigator. Rather than bisect node_modules further,
replaced react-navigation with react-router for this variant only - native
keeps react-navigation unchanged.

What changed:

- playground/app/src/root-navigation.web.tsx (the @react-navigation/stack
  attempt) deleted - no react-navigation-based file for web at all anymore.
- packages/core/navigation/index.web.ts (new) - useRoute/useIsRouteFocused
  via react-router's useLocation, mirroring index.browser.ts's own
  pathname/locale-stripping logic exactly (swapping
  next-unchecked/navigation's usePathname for useLocation).
- packages/core/tw/components/without-class-name/link-untyped.web.tsx
  (new) - LinkUntypedWocn via react-router's Link, mirroring the base
  link-untyped.tsx's own locale-prefixing exactly (swapping next/link for
  react-router's Link).
- Both of the above import their i18n dependency via the direct
  `#/core/i18n/index.web` path, not the generic `#/core/i18n` - the
  generic specifier resolves fine at runtime (vite-config's alias
  mechanism), but tsc always resolves it to the server variant's type
  (async, `Promise<string>`) since customConditions has no notion of "web"
  as a resolution condition, which doesn't match index.web.ts's genuinely
  sync implementation - same class of issue as issue 6's keySalt work,
  different resolution: import the variant-specific sibling directly
  instead of writing `await` and relying on babel-plugin-async-hook to
  strip it (which only works when the variant's own implementation
  actually is async - i18n's web variant isn't).
- packages/devtools/vite-config's `nativeSharedModules` override list
  (used to alias `rntwsc/navigation` and
  `rntwsc/tw/components/without-class-name/link-untyped` at their .native
  file) is now empty - left the mechanism itself in place, generic and
  possibly useful again, rather than removing it.
- playground/app/src/app.web.tsx rewritten: no more `linking` config or
  `<Navigation>` render. Wraps everything in react-router's
  `<BrowserRouter>` and renders a small `PageRouter` component that strips
  an optional leading `/:locale` URL segment from `useLocation().pathname`
  (same idea the old `linking.getStateFromPath` had), syncs i18next's
  language to it if present (the old code didn't actually do this itself -
  next.js's proxy sets the locale cookie server-side per request, which a
  Vite SPA has no equivalent of, so this is arguably a fix, not just a
  port), then looks the remaining path up directly in routesNative - no
  react-router `<Route>` tree, since a flat map lookup is simpler than
  reconstructing one from routesNative.
- `packages/core/navigation` and `packages/core/tw`'s own package.json
  gained `react-router: "*"` as a peerDependency (matching the existing
  `@react-navigation/native: "*"` entries) - needed for their own tsc
  project to resolve it; pnpm links a peer dep into a package's own
  node_modules once something in the workspace can satisfy it, but only
  after `pnpm install` actually runs against the new package.json.

Verified via real interactive browser testing, not just the route sweep -
clicking a sidebar Link does real client-side navigation (URL changes, new
page content renders, no full reload), confirming react-router's Link
component (via link-untyped.web.tsx) works end to end, not just direct URL
loads.

Suggestion for anyone touching this again: if react-navigation ever needs
revisiting for web (a future version fixes the underlying issue, for
example), the failure mode to watch for is exactly this - "Failed to set
an indexed property [0] on 'CSSStyleDeclaration'" thrown from deep inside
react-dom's setValueForStyle, with an empty page (nothing rendered yet).
The isolation technique that worked twice: temporarily replace whatever
renders the navigator with a static placeholder and see if the crash
disappears - if it does, the bug is inside the navigator's own tree, not
app code.

## 15. create-rntwsc-app scaffolding package

STATUS: fixed. packages/cli/create-rntwsc-app - `pnpm create rntwsc-app
my-app` / `npx create-rntwsc-app my-app` scaffolds a full pnpm workspace
(app/ for React Native, web/ for Next.js, sharing one src/ tree), wires up
tsconfig path aliases, babel, and Next config, and ships a working starter
home page with a real Settings feature (theme/dark mode/language, wired to
actual state, not a placeholder) - see getting-started.md. See issues 19,
20, and 21 for the bugs found and fixed while making the generated project
actually build and run, and the test coverage (real-templates.test.ts,
e2e-create-rntwsc-app) added so a broken generated project fails a normal
`pnpm test`/`pnpm e2e:create-rntwsc-app` run instead of only being caught
by hand.

## 16. Native fetch/graphql are stub re-exports of the browser variant

STATUS: open. packages/core/fetch/index.native.ts and
packages/core/graphql/index.native.ts just re-export the browser code.
Native may eventually need offline cache (MMKV/AsyncStorage), re-fetch on
app focus or network reconnect, background fetch, or push-notification
invalidation. Once native needs any of this, it needs its own file
instead of a re-export.

## 17. useFetch does not cancel a pending request

STATUS: fixed for useFetch. `packages/core/fetch/index.browser.ts`'s
`refetch()` now creates an `AbortController` per call, aborting whichever
one was still in flight before starting a new one (either because the
component unmounted or because `refetch()`/the key-change effect ran
again). Both the success and error handlers bail out early on
`controller.signal.aborted` before touching the shared store or local
loading state, so an old request settling after being superseded can never
overwrite a newer result. Two effects instead of one: the "should I fetch"
effect still depends on `[k, refetch]`, but the abort-on-cleanup effect
depends only on `[k]`, so an unstable `refetch` reference (e.g. an inline
headers object re-created every render) re-running the first effect cannot
spuriously abort a still-valid request. See
packages/core/fetch/index.browser.test.ts.

useFetchGraphQL was left alone - Apollo Client's own `useQuery` already
cancels/ignores a superseded in-flight request itself when variables
change or the component unmounts, so this class of bug does not apply to
it the same way; nothing pointed at Apollo actually leaking a stale
result the way plain useFetch did.

## 18. Apollo auto-refetch does not clear hydrationErr

STATUS: fixed. `packages/core/graphql/index.browser.ts` now also clears
hydrationErr from a `useEffect` that watches Apollo's own `r.loading`/
`r.error`, using the second suggested direction (loading true -> false
with no error) rather than watching `client.watchQuery` directly - simpler
and covers polling, cache invalidation, and network recovery alike, since
all of them go through the same `r.loading` transition regardless of what
triggered them. Does not fire on the initial mount, since the tracking ref
and `r.loading` start equal there (see
`shouldClearHydrationErrBrowser`'s own test for this). The existing
`clearHydrationErr` call inside our own `refetch()` is unchanged - it
still clears optimistically the moment the user clicks refetch, before
the request even settles; the new effect only covers requests our own
`refetch()` did not initiate. See
packages/core/graphql/index.browser.test.ts.

## 19. create-rntwsc-app: broken native nav, no default rntwsc pin, no verification

STATUS: fixed. Three separate, real bugs found while making the CLI's
generated project actually usable end to end:

- app.native.tsx imported `@/root-navigation`, but no manifest entry ever
  copied a root-navigation.tsx into the generated project - every native
  build would have failed. Fixed by adding it to playgroundSafeManifest
  (auto-synced from playground/app/src/root-navigation.tsx, which needs no
  changes to work with a single-route routesNative map).
- create-rntwsc-app's default `--rntwsc-version` is dist-cli/package.json's
  `version` field, a bare semver like "0.0.23" - but rntwsc is git-tarball
  only, never published to npm, so `pnpm install` on a freshly generated
  project fails with no such package unless `--rntwsc-version
github:namnm/rntwsc#<commit>` is passed explicitly. Left as-is
  deliberately (the semver default is what a real npm publish of rntwsc
  would need, a separate decision from this CLI) - but nothing was actually
  exercising this path end to end, so e2e-create-rntwsc-app now always
  passes the real spec explicitly (read from root package.json's own
  `dependencies.rntwsc`), the same way any human working around this today
  would.
- nothing verified the generated project actually compiled or ran - see
  packages/cli/create-rntwsc-app/src/real-templates.test.ts (fast, static
  check that every @/ import and every t() call resolves, against the real
  templates) and packages/cli/e2e-create-rntwsc-app (slow, real pnpm
  install + tsc + next build, run via `pnpm e2e:create-rntwsc-app`) - see
  contribution/build.md.

Also added a working Settings feature to the template (theme picker, dark
mode toggle, language switcher), reusing the same hooks playground/app's
own switcher components use (rntwsc/dark-mode, rntwsc/theme,
rntwsc/i18n/use-i18n-switcher-props), packaged as a self-contained
`<SettingsButton />` (button + Modal) instead of playground's always-visible
sidebar section - meant to be usable in a real app without rewriting it.
Verified via the new e2e test: a fresh project's `pnpm tsc` and `next build`
both pass with these components in place.

Separately, build-dist now copies docs/*.md (not docs/contribution/ or
docs/todo.md) into dist/docs/, so an installed rntwsc package carries its
own docs for local/offline reference - useful for a coding agent working in
a consumer project, which can't necessarily fetch a live GitHub URL but can
read node_modules directly.

## 20. e2e route list was hand-duplicated, no client-nav coverage

STATUS: fixed. Two gaps in the e2e suite, found on review of issue 19's
work:

- e2e/routes.ts hardcoded a literal copy of
  playground/app/src/pages/route-paths.ts - adding a page meant remembering
  to also edit the e2e file, easy to forget. Now a relative import of
  route-paths.ts directly (not the `@/` alias, which Playwright's transform
  does not resolve - route-paths.ts has no imports of its own, so a
  relative import needs no further setup). Verified against a real
  Playwright run, not just tsc.
- every existing route test reaches its route via `page.goto()` - a fresh
  SSR load with its own dehydration payload. Nothing tested reaching
  /fetch or /graphql via real client-side navigation instead (clicking a
  sidebar link, no full reload), which has no fresh SSR response of its
  own to hydrate from - the exact class of gap issue 6's dehydration key
  collision was found in. Added e2e/client-nav.spec.ts: goto '/', click
  into /fetch then /graphql, assert no console/page errors throughout.
  Not run against vite (see routes-vite.spec.ts) - a plain client SPA has
  no SSR dehydration payload for either path to diverge on, so there is
  nothing this test would catch there.

Also reverted part of issue 19's fix on request: create-rntwsc-app's
default `--rntwsc-version` goes back to a bare semver (dist-cli/package.json's
`version`), not a resolved `github:namnm/rntwsc#<commit>` spec - the semver
default is deliberately what a real npm publish of rntwsc would need later,
a separate decision from this CLI. `pnpm i` on a project generated with no
override still fails until rntwsc is actually on npm; e2e-create-rntwsc-app
now passes `--rntwsc-version` explicitly (reading the real spec from root
package.json's own `dependencies.rntwsc`) so the test still installs for
real without changing that default.

## 21. Tried defaulting keySalt automatically per variant - does not work

STATUS: reverted, not fixable this way. Explored whether `UseFetch.keySalt`/
`UseApollo.keySalt` (see issue 6) could default automatically instead of
requiring every caller to pass one explicitly - two new files,
`packages/core/hydration/key-salt.ts` ('server') and `key-salt.browser.ts`
('client'), applied as each `useFetch`/`useFetchGraphQL` implementation's
default parameter value.

Confirmed broken by a real production build, not just reasoning about it:
curled /graphql and found only one `<template>` marker (`keySalt:"server"`),
and no loading/error/`!data` state anywhere in the raw SSR HTML either -
both the true Server Component group and the async Client Component group
resolved to the SAME default and shared one dehydration key, then the real
browser (which does read the browser default correctly) looked for a key
that only ever existed under the server default. React error #418, same
as before keySalt existed.

Root cause: a Server Component's call and an async `'use client'`
component's SSR-time call both execute the exact same `index.ts` module -
"its SSR pass does await the same server-side data-fetching path a plain
Server Component uses" (see contribution/hydration.md, and the reason
dehydrate.tsx itself has no browser variant) is not just a fact about
dehydrate.tsx, it means there is no file-level signal at the point
`useFetch`/`useFetchGraphQL` runs that can tell these two apart - both are
`index.ts`. Only the real browser's hydration pass ever reaches
`index.browser.ts`. Whatever needs to differ between "this Server Component
instance" and "this Client Component instance" has to live in the calling
component's own source (a literal keySalt string), not in a module that
both call sites end up resolving identically during SSR.

Reverted: key-salt.ts/key-salt.browser.ts deleted, fetch/graphql's index.ts
and index.browser.ts back to `keySalt` with no default, playground's
fetch-client.tsx/graphql-client.tsx back to explicit `keySalt: 'client'`.
Verified via a full `pnpm e2e` run before and after - green both times,
confirming the revert actually restored the working state and was not
itself untested.

## 22. Made dedupe opt-in instead of always-on, default now collision-safe

STATUS: fixed. Follow-up to issue 21: rather than trying to make keySalt
unnecessary via an automatic default (does not work, see issue 21), made
the dedup step that actually causes the collision skippable, and skipped
by default.

`packages/core/cache/config.ts` (new) - `initCache({ enableDedupe })`,
`getEnableDedupe()`, globalThis-keyed via globalStore since
dehydrate-template.tsx is pulled into virtually every route and a
code-split bundle could otherwise end up with more than one copy of this
module, each with its own separate `let`. Follows the same
initSingleton-guarded init/getter pattern as initTheme/initI18n.

`packages/core/hydration/dehydrate-template.tsx` - extracted the actual
embed decision into a pure `shouldEmbedTemplate()`, gated the dedup Set
check on `getEnableDedupe()`. Default false: every call renders its own
`<template>`, so the SSR-vs-hydrate collision this section is about
cannot happen regardless of keySalt. `enableDedupe: true` restores the
previous always-on behavior (smaller payload when the same key repeats
across a page, but needs keySalt wherever a Server Component and a Client
Component share a key).

Verified all three combinations against a real production build
(turbopack + webpack, playground's own /fetch and /graphql, with
playground's keySalt temporarily removed to isolate what each setting
does on its own):

- default (enableDedupe unset), no keySalt: passes - the bug cannot occur.
- `initCache({ enableDedupe: true })`, no keySalt: reproduces issue 6/21's
  React error #418 exactly - confirms the toggle actually gates the old
  behavior, not just in theory.
- `initCache({ enableDedupe: true })` + keySalt: passes - confirms dedupe
  and keySalt compose correctly together.

Added packages/core/hydration/dehydrate-template.test.ts, simulating the
exact SSR-vs-hydrate sequence found in issue 21 (server-side Set covering
every instance in one request vs a browser-side Set covering only the
Client Component instances that actually hydrate) directly against
`shouldEmbedTemplate()` - no React rendering or Next.js needed, so this
runs as a normal fast `pnpm test` case instead of requiring a real browser
build. Chose this over a dedicated e2e build (would need a separate
NEXT_PUBLIC_-gated build/server per docs/contribution/build.md's existing
`NEXT_PUBLIC_MINIFY_CLASS_NAMES` pattern, since `enableDedupe` is genuine
globalThis state, not request-scoped, so testing two values against one
shared server risked cross-test interference under Playwright's
`fullyParallel` workers) after discussing the tradeoff.

## 23. create-rntwsc-app's generated project has no way to run extract-tw-class-names or check-i18n-labels

STATUS: open. Confirmed by reading both sides: the generated project's
root package.json only wires up `node ./devtools normalize,doctoc,eslint,
prettier` (packages/cli/create-rntwsc-app/.templates/root/
package.template.json), calling `rntwsc/devtools`'s published `run()`
(packages/devtools/index.ts) - whose own function map is `{doctoc,
normalize, eslint, stylelint, prettier, tsc, type-coverage,
css-extract-variables}`. extract-tw-class-names and check-i18n-labels are
not in that map at all - they only exist as this monorepo's own
packages/cli/extract-tw-class-names and packages/cli/check-i18n-labels,
run through packages/cli/devtools (`pnpm extract`, `pnpm
check-i18n-labels`), which is never published.

Practical effect: a real consumer's generated project ships the starter's
one-time class-names.min.json snapshot (see issue 7) forever - adding new
Tailwind class names never re-minifies it - and has no i18n label
validation at all, dynamic-key gaps like issue 24 included.

Suggestion: publish extract-tw-class-names and check-i18n-labels as part
of `rntwsc/devtools` (or a new `rntwsc/cli` entry point) the same way the
other devtools scripts are, and wire them into create-rntwsc-app's
generated package.json scripts/fmt chain.

## 24. i18n label validation silently skips dynamic keys - no unused/missing signal for them

STATUS: open. packages/devtools/babel-plugin-i18n-labels-validation's
`collectUsages` only records a usage when the translation call's key
argument is a string literal (`if (!t.isStringLiteral(keyArg)) return`) -
a dynamic key (`t(someVar)`, `t(\`prefix_${suffix}\`)`, `t(getKey())`) is
silently skipped entirely, both directions:

- Never counted as a usage, so a key that is only ever referenced
  dynamically gets incorrectly flagged as "unused" (see issue 7/the
  `unused` list in packages/cli/check-i18n-labels) even though it is
  genuinely used.
- Never checked against the labels file either, so a dynamic key that
  resolves to something absent from labels at runtime gets no build-time
  or lint-time signal at all - the only place it would surface is
  react-i18next's own runtime "missingKey" behavior in the actual app,
  not this repo's own validation tooling.

Suggestion: at minimum, warn (not silently skip) when a translation call's
key argument is not a string literal, so a dynamic key is a visible,
deliberate opt-out rather than an invisible gap in both the missing and
unused checks. A fuller fix would need either requiring dynamic keys to be
drawn from a statically-known union (so the set of possible values is
still enumerable) or accepting that fully dynamic keys are opaque to
static analysis and can only be caught by a runtime check.

## 25. i18n loads every language's labels into one bundle, no per-language async loading

STATUS: open. `initI18n(locales, labels)` (packages/core/i18n/config.ts's
`initLabels`) passes `labels` straight into `i18next.init({ resources:
labels, ... })` - a single synchronous object i18next requires upfront, so
every consumer builds it via eager static imports of every locale's every
namespace (see create-rntwsc-app's app/src/i18n/labels/index.ts: `import
enCommon from './en/common.json'`, `import zhCommon from
'./zh/common.json'`, `import arCommon from './ar/common.json'`, all
unconditionally). A user who only ever needs `en-US` still downloads
`zh-CN` and `ar-AE`'s labels too - this scales with both the number of
supported locales and the number of namespaces/label keys, and only gets
worse as an app's label set grows.

i18next itself already has plugins built for exactly this
(i18next-http-backend for fetching a JSON file per language over http,
i18next-resources-to-backend for a dynamic `import()`-per-language/
namespace loader) - `initLabels` would need to accept something other than
a plain resolved object (a `backend` config, or a lazy resource loader
function) and thread it into `i18next.init()` instead of always requiring
`resources` upfront. Needs a decision on which loading mechanism to
support first (static-file-per-locale via http backend is simplest for
web; native has no bundler-level route-splitting the same way, so a
dynamic `import()` backend or an app-bundled-but-lazy-required approach
may fit better there) and whether both need supporting or one is enough
for v1.

## 26. Fill out the component set: Toast, Tabs, Tooltip, Avatar, Progress/Slider, Combobox

STATUS: fixed. Added all seven (Progress and Slider counted separately)
under packages/core/components/{avatar,progress,tabs,slider,tooltip,toast,combobox},
each with its own index.test.tsx, a playground demo page, and full nav/route
wiring. All follow the existing conventions: cva-based variants, the
Root+Object.assign compound pattern with context for Avatar/Tabs, Portal
for Toast's viewport (plus its own store.ts mirroring portal/store.ts),
and a genuine web/native split for Tooltip (hover+focus via
@floating-ui/react on web, long-press via @floating-ui/react-native on
native) since it needed one the way Dropdown already does. Slider uses
RN's core Gesture Responder System (onStartShouldSetResponder/
onResponderMove) directly - no new gesture dependency was needed since
react-native-web already implements the responder system. Combobox reuses
Select's Dropdown/Drawer responsive-trigger pattern but with the trigger
itself as a real TextInput for free-text filtering, single-select only.
Published as dist 0.0.29 and verified end to end: full tsc, 613 vitest
tests, and a real turbopack dev server smoke test (drag, hover, tab
switching, toast trigger, combobox filter+select all confirmed working
in a headless browser).

## 27. Auth/session and authz (roles, orgs, permissions) built-ins

STATUS: open. rntwsc has no auth or authz package at all today - every
consumer builds session/token handling from scratch. ~/ws/suite (a real
consumer of rntwsc) already has its own packages/core/auth and
packages/core/authz, and its auth-token module is worth looking at
directly as a reference: it is structurally the same pattern as rntwsc's
own dark-mode/theme (packages/core/dark-mode, packages/core/theme) -
cookie-backed on server+browser (readable via next-unchecked/headers with
no client round-trip, matching index.ts/index.browser.tsx's split),
storage-backed on native (rntwsc/libs/storage, since native has no
same-origin proxy to read a cookie from), useSyncExternalStore-based
reactivity, and the same serverCache-scoped `sck` key pattern rntwsc
itself uses. A generic `rntwsc/auth` (current token, set/clear, an
`AuthOverlay`-style gate component for protected routes) looks directly
extractable from that shape with the business-specific parts stripped out.

authz (suite's packages/core/authz - current org, current role for
multi-tenant "acting as" switching, a col-level allow/deny policy shape
mirroring a specific server-side authz system, cross-tab sync via a
broadcast channel so switching org/role in one tab updates others) is
more app-specific and harder to generalize as-is, but the underlying
patterns (current-org/current-role's cookie+storage split, the
broadcast-for-cross-tab-sync approach) are still worth keeping as
reference even if the policy-shape part stays out of scope for a first
version.

Suggestion: start with the auth/session piece only (token storage +
protected-route gating), since it is the part that generalizes cleanly;
treat authz as a second, separate, more open-ended effort once there is
more than one real consumer's shape to generalize from.

## 28. Cross-platform file/media picker (camera roll, take photo, crop)

STATUS: open. No file or image picker primitive exists in rntwsc today.
Native needs real device functionality - photo library access, taking a
new picture with the camera, cropping - which has no web equivalent at
all (a browser `<input type="file">` has no camera-roll or crop UI of its
own). Needs a per-variant design from the start, not a shared
implementation with a native-only fallback: native wraps a real picker
library (permissions handling included), web should still be as capable
as the platform allows (drag-and-drop, `<input type="file" accept="image/
*" capture>` for camera access on mobile browsers, an in-browser crop UI
since there is no OS-level one to defer to). Scope and API shape
(promise-based single call vs a component) need deciding before
implementation - this is a bigger design task than most items on this
list, closer in size to issue 27 than to a typical component addition.

## 29. Built-in common native functionality (push notifications first)

STATUS: open. Things like push notifications need real native setup
(FCM/APNs registration, permission prompts, a token to hand to the
backend, foreground/background notification handling) that every
consumer currently has to wire up by hand, with no web equivalent (or a
different one - web push has its own separate registration flow). The
ask is for this to work like the rest of rntwsc's native integrations:
install a package, run through create-rntwsc-app's native setup, then
just call a config function and use a hook - not hand-roll the native
module wiring per project. Push notifications is the concrete first
target; the same install-and-configure shape would generalize to other
common native capabilities later (deep linking, biometric auth, etc.) -
worth designing the FIRST one with that reuse in mind rather than
one-off.

## 30. create-rntwsc-app: flags to pick which features land in the generated project

STATUS: open. Today create-rntwsc-app's output is fixed - every generated
project gets the same starter shape (see issue 15). As the framework
grows more optional pieces (auth from issue 27, push notifications from
issue 29, specific component sets from issue 31), generating all of them
unconditionally stops making sense - most projects will not want every
optional feature's setup code and dependencies. Needs CLI flags (or an
interactive prompt when none are passed) to select which optional
features to include, and the manifest/token-substitution system in
packages/cli/create-rntwsc-app/src/generate.ts and manifest.ts extended to
conditionally include entries based on the selected set rather than
always copying the full manifest. Depends on issues 27/28/29 existing as
real, generalized features first - nothing to gate yet otherwise.

## 31. Pre-built page/component sets for common app shapes (dashboard, storefront, blog)

STATUS: open. Beyond individual primitives (issue 26), a starter set of
higher-level, common full-page patterns - a dashboard shell (sidebar +
stat cards + charts area), an ecommerce storefront (product grid, cart,
checkout flow), a blog/news layout (post list, article page) - would let
create-rntwsc-app (see issue 30's flag-based selection) scaffold
something closer to a real app on day one instead of just the current
single-page starter. Larger in scope than a component addition - each of
these is closer to a template/example app than a reusable primitive, and
would need its own decision about where it lives (part of
create-rntwsc-app's templates, or a separate example-apps package
consumers copy from) before starting.

## 32. Component set gaps remaining after issue 26

STATUS: open. Re-audited packages/core/components after issue 26 landed
(accordion, alert, avatar, badge, button, button-group,
button-toggle-group, checkbox, combobox, date-picker, drawer, dropdown,
form, icon, input, inset, modal, portal, progress, radio, ripple, select,
separator, skeleton, slider, slot, spinner, switch, tabs, text, toast,
tooltip - confirmed via a directory listing). Two kinds of gaps left:
components that do not exist at all yet, and features scoped out of an
existing component's first version.

New components worth adding, roughly in order of how often a real app
needs them:

- Popover - Dropdown already does the positioning work (`open`/`onClose`/
  `reference`, floating-ui on web, floating-ui/react-native on native,
  documented in docs/components.md as "Contextual popover menu") but has
  no self-managed trigger/open state of its own - every current consumer
  (Select, DatePicker, Combobox) supplies that itself. Tooltip already
  shows the pattern for wrapping an arbitrary single child as a trigger
  via Slot; a Popover would be the click-triggered, arbitrary-content
  equivalent (a form, a menu, anything), the general-purpose primitive
  Dropdown was never quite exposed as directly. Confirmed no such export
  exists anywhere in the repo today.
- Table - no table/data-table component exists (issue 3 found the same
  for the "suite" consumer's own DataGrid, out of scope there). React
  Native has no native table element, so this needs building from
  View rows from scratch, same as everything else here - worth having
  as a plain, non-virtualized table (header row, sortable column
  headers, striped/hover row states) for dashboards and admin panels,
  which is a use case issue 27/31 both already point at.
- ConfirmDialog / AlertDialog - Modal exists as a generic centered
  overlay, but "confirm before a destructive action" (title, message,
  confirm/cancel buttons, a danger appearance for delete-style actions)
  is common enough to be its own thin wrapper around Modal + Button,
  worth shipping so consumers stop rebuilding the same
  title-body-two-buttons layout by hand.
- Pagination - page-number/prev-next navigation for any list or table,
  no existing primitive covers this.
- Breadcrumb - path-style navigation trail, no existing primitive covers
  this.
- Chip/Tag - an interactive, dismissible label (an "x" to remove),
  distinct from Badge (static, no interaction). Directly useful for a
  multi-select input rendered as removable chips instead of Select's
  current comma-joined text summary, and for a tag input pattern in
  general.
- AvatarGroup - overlapping/stacked avatars with a "+N" overflow count,
  a near-universal pattern anywhere a list of users needs to fit in a
  small space (assignees, team members, participants). Natural extension
  of Avatar (issue 26), confirmed no such export exists on it today.
- Standalone Calendar - date-picker/index.tsx has a `Calendar`
  sub-component (packages/core/components/date-picker/index.tsx, uses
  get-calendar-grid.ts for the month grid) but it is not exported -
  confirmed via grep, it only exists inline, reachable only through
  DatePicker's trigger+drawer/dropdown flow. An inline, always-visible
  calendar (for a dashboard "today's events" widget, or a full
  date-range picker built on top, see below) needs it exported as its
  own component.
- EmptyState - icon/illustration + heading + subtext + optional action
  button, for empty lists, empty search results, empty inboxes. Select
  and Combobox each have their own minimal text-only
  emptyLabel/noResultsLabel today; a shared, richer component would be
  more reusable across lists/tables/dashboards generally than
  duplicating this per component.

Feature gaps in components that already exist, each scoped out
deliberately when the component was first built:

- Combobox is single-select only (packages/core/components/combobox/index.tsx,
  see issue 26's writeup) - a multi-select combobox (free-text filter
  plus multiple chips, likely wanting the Chip component above) was
  explicitly left out of the first version.
- DatePicker has no range mode - confirmed no `range`/`Range` reference
  anywhere in packages/core/components/date-picker/index.tsx, single
  date only. A from/to range picker is a common ecommerce/booking/
  analytics-dashboard need (see issue 31's dashboard/storefront shapes).
- Slider is single-thumb only (packages/core/components/slider/index.tsx)
  - a two-thumb range slider (min/max) was scoped out of the first
    version, would need a second thumb, a filled-between-thumbs indicator,
    and deciding how the two thumbs cannot cross each other.
- Toast has no promise-based mode - `toast()` (packages/core/components/toast/store.ts)
  only takes a fixed type/message/duration today. A `toast.promise(promise,
{ loading, success, error })` helper that morphs one toast through
  loading -> success/error states is a very commonly reached-for toast
  library feature (sonner, react-hot-toast both have it) and fits
  naturally on top of the existing store.
- Tabs only supports a horizontal row (packages/core/components/tabs/index.tsx's
  `List` slot is a fixed `flex-row`) - a vertical orientation (sidebar-
  style tabs, common in settings pages) was not part of the first
  version.

## 33. twStableProvider should accept an array of selector categories, not just a boolean

STATUS: open. This was originally written up as a TextStyleProvider issue -
wrong target, corrected here. `twStableProvider` is a real, existing prop
(`packages/core/tw/components/lib/common-props.ts`'s `CommonProps.
twStableProvider?: boolean`), consumed only on native by
`packages/core/tw/lib/create-class-name-component.native.tsx`'s
`getInitialMetadata(stableProvider)`.

Background: a native class-name component's first render inspects its
className for selector prefixes (`dark:`, `sm:`, `active:`, `group-*`,
`peer-*`, etc.) and builds a `ClassNameMetadata` (`responsive`, `darkMode`,
`active`, `focus`, `group`, `peer` - see packages/core/tw/class-name.ts)
that decides which state-subscribing HOCs wrap it (`withResponsive`,
`withDarkMode`, `withActive`, `withFocus`, `withGroup`, `withPeer` in the
same file). If a later render's className implies a _different_ set of
categories, `shouldRerenderMetadata` logs "Expect class names with
selector should be stable ... or use twStableProvider on this component
to subscribe to all selectors" - `twStableProvider: true` is the escape
hatch, but it is all-or-nothing: `getInitialMetadata` unconditionally
turns on every category (`responsive: true, darkMode: true, active: true,
focus: true, group: true, peer: true, groupProviders: ['-'], peerProviders:
['-']`) the moment it is truthy, even if only one category is actually
unstable across renders - paying for every HOC's subscription regardless.

Suggestion: widen `twStableProvider`'s type from `boolean` to
`boolean | Array<'responsive' | 'darkMode' | 'active' | 'focus' | 'group' | 'peer'>`,
and have `getInitialMetadata` build the metadata object from just the
named categories when given an array, keeping today's all-categories
behavior when given `true` and no metadata when given `false`/omitted.
`groupProviders`/`peerProviders` (string-keyed, not plain booleans) would
need a decision on whether they ride along with `'group'`/`'peer'` in the
array or need their own separate opt-in - worth resolving as part of the
implementation, not guessing at here.

## 34. GraphQL-specific auto-loading layer for Combobox (operation name in, results out)

STATUS: open. Combobox now supports a generic async `items` fetcher
(`(query: string) => ComboboxItem[] | Promise<ComboboxItem[]>`, see
packages/core/components/combobox/index.tsx) - deliberately generic,
zero GraphQL knowledge. ~/ws/suite (a real consumer) already has a
GraphQL-specific async dropdown, `EntityDropdown`
(packages/core/prelude/components/entity-dropdown/index.tsx), built before
Combobox had any async support at all - it drives rntwsc's `Select` via
external `onSearch`/array state instead of an items-as-function, hand-rolls
its own debounce (no shared debounce hook existed anywhere - see the new
`useDebouncedValue`, packages/libs/hooks/use-debounced-value.ts, which
closes that specific gap), and overloads `emptyLabel` to also mean
"loading" instead of using a real loading state.

The ask this issue tracks: a thin GraphQL-specific wrapper that takes just
an operation name (a runtime string, not a compile-time codegen'd hook -
model/operation are often dynamic in a generic entity picker) and wires it
straight into Combobox's new `items` fetcher automatically, so a consumer
writes `<EntityCombobox model='Product' operation='productSearch' />`
instead of hand-rolling `EntityDropdown`-style plumbing per app.

The one already-generic, reusable piece worth building on directly:
`buildOperationDocument(kind, operationName, variableDefs, selection)`
(~/ws/suite's packages/core/db/dynamic-query.ts) - takes a runtime
operation-name string plus explicit `OperationVariable[]`/selection
declarations and assembles the `DocumentNode` via `gql()`, no compile-time
codegen dependency. This is exactly the "runtime operation name, not a
generated hook" mechanism the ask wants, already proven working in
`EntityDropdown`.

Two open decisions before building, not guessed at here:

- Where this lives - a new `rntwsc/graphql`-facing package once there is
  a natural home for GraphQL-aware UI helpers (rntwsc already ships
  useFetchGraphQL, see docs/hydration.md), or stays app-specific in
  suite/consumers if the `*Filter`/`Pagination` variable-naming convention
  `dynamic-query.ts` assumes is too suite-specific to generalize as-is.
- The "resolve an unseen value's label" gap - a controlled `value` whose
  label was never part of a resolved search result (e.g. an edit form
  loading an existing id before any search ran) has no label to show.
  `EntityDropdown` solves this today with a separate imperative
  `apolloClient().query()` side-fetch; the generic Combobox deliberately
  does not attempt this (real complexity, not needed by every async
  consumer) - this GraphQL-specific layer is exactly where it belongs.
