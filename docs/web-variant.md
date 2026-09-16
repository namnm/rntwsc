<!-- START doctoc -->

- [Web variant](#web-variant)
  - [Fallback resolution, not reexport files](#fallback-resolution-not-reexport-files)
  - [navigation and link-untyped: no longer shared with native](#navigation-and-link-untyped-no-longer-shared-with-native)
  - [When to add a real web file](#when-to-add-a-real-web-file)

<!-- END doctoc -->

# Web variant

Works like the browser variant, but for a plain client-side Vite SPA - no NextJS, no RSC, no server at all. Named `web` (not `spa`) to match the wider React Native ecosystem's own convention (Metro/webpack resolve a bare `require('./foo')` to `foo.web.js` over `foo.js` for a web target) - see contribution/vite.md for where that convention also matters for third-party packages, separately from this variant. A foo.web.ts or foo.web.tsx file next to foo.ts is picked up automatically as this build's implementation of the same module, resolved at Vite's resolver level (resolve.alias, via @rollup/plugin-alias) before any babel transform runs. See contribution/vite.md for the resolver mechanism.

Since a Vite SPA has no server compilation target, there is no server/client split to protect the way next-config has to protect one - every web alias applies unconditionally, once.

## Fallback resolution, not reexport files

Most modules have no web-specific logic of their own - their browser implementation (cookie-based, or just framework-agnostic) already works unchanged in a plain SPA. Rather than shipping a throwaway `foo.web.ts` containing only `export * from '#/core/foo/index.browser'` for every such module, packages/devtools/vite-config computes this as a fallback directly in the resolver: any module with a browser file but no web file of its own resolves to its browser file automatically. cache, fetch, graphql, dark-mode, theme, and responsive/use-safe-area all work this way - none of them ship a `.web.` file at all.

## navigation and link-untyped: no longer shared with native

navigation and tw/components/without-class-name/link-untyped used to be a deliberate exception to the browser-fallback rule above: a Vite SPA is architecturally the same shape as a native app, so it reused native's own react-navigation stack verbatim instead of a second router library, via a small explicit override in vite-config's alias map pointing just these two module paths at their `.native` file. Abandoned once @react-navigation/native-stack, and then its own JS-based createStackNavigator alternative, both turned out to crash on web the same way (a style prop shaped as a plain array reaching a raw DOM element unflattened, inside react-navigation's own shared rendering, not something a navigator swap could fix - see docs/todo.md). Both modules now ship a real `index.web.ts`/`link-untyped.web.tsx` using react-router instead - a real second router library, which the original design deliberately avoided, but turned out unavoidable. The override mechanism itself is still in vite-config, just with an empty list - kept in case something unrelated genuinely needs to share a native file verbatim again.

playground/app/src/app.web.tsx owns the actual router setup: a `<BrowserRouter>` wrapping a small `PageRouter` component that strips an optional leading `/:locale` URL segment (mirroring what next/proxy.ts does server-side for the NextJS playgrounds, but client-side and without a redirect), syncs i18next's language from it if present, and renders whichever page routesNative maps the remaining path to.

## When to add a real web file

i18n, navigation, and tw/components/without-class-name/link-untyped are the modules that ship a real web file today. i18n's `index.web.ts` (its logic - wrapping react-i18next's own hooks directly, owning its own init lifecycle - is close enough to native's that both variants share their common code from packages/core/i18n/shared.tsx) is the one case close enough to just add a thin platform wrapper; navigation and link-untyped needed a genuinely different implementation (react-router instead of react-navigation), not a thin wrapper over shared code. Add a real web file like this only when the browser-fallback option above falls short - most new platform-specific code should reach first for a shared file plus a thin wrapper, or, if it turns out to be identical to browser's, no web file at all (like theme/dark-mode).

no-missing-export does not know about the web variant at all (only native/ios/android/browser) - it never requires a web file to exist or to re-export what a browser/native sibling does. no-import-invalid-variant does know about it (`web` is a real entry in its own variant list, same enforcement as browser/native: a web file importing a browser/native-suffixed sibling needs a `// eslint-disable-line custom/no-import-invalid-variant` comment on that specific import, per CLAUDE.md's preference for a targeted disable over a rule change) - see app.web.tsx's own imports of routesNative and dark-mode/theme's browser-suffixed hooks for examples.
