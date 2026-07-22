<!-- START doctoc -->

- [Browser variant](#browser-variant)
  - [When to add a browser file](#when-to-add-a-browser-file)

<!-- END doctoc -->

# Browser variant

Works like Metro's native, ios, and android resolution, but for the browser bundle. A foo.browser.ts or foo.browser.tsx file next to foo.ts is picked up automatically as the browser build's implementation of the same module - resolved at the bundler's resolver level (webpack alias, Turbopack resolveAlias), before any babel transform runs, so Next's own RSC boundary validation already sees the correct file. See contribution/turbopack.md for the resolver mechanism in both bundlers.

next/headers and other RSC-only modules are blocked from browser bundles by a Babel plugin that throws a build error on a matching import in a file compiled for the client. Framework code that needs to read a cookie or header imports through the next-unchecked namespace instead (for example next-unchecked headers), which is aliased to the framework's own wrapper - this only stays safe because that import lives in the default, server-only variant of the file, with a separate browser sibling covering the client case, so the client build never actually reaches it.

Cache gotcha: adding or removing a browser file requires deleting .next and restarting the dev server - the resolved path gets cached.

Export parity: a custom ESLint rule checks that each variant exports the same names as the default. To intentionally allow a variant-only export, suffix its name with the variant, for example somethingNative in a native file.

No web dot browser: only browser is supported as a variant, in addition to native. Default (server) is the broadest, then browser, then native.

## When to add a browser file

Add a foo.browser.ts sibling when the default (server) implementation calls an async, server-only hook (reading a cookie or header, for example) and the same logic also needs to run inside a Client Component - the browser file provides a synchronous substitute built on client-safe primitives (useSyncExternalStore, a hook from next-unchecked navigation, and so on). See theme.md, i18n.md, navigation.md, and dark-mode.md for concrete examples of this pattern.

If the default implementation has no server-only calls, skip the browser file entirely - the same source already works everywhere. If a module is genuinely server-only and must never reach a browser bundle, leave it without a browser file and import next/headers (or another RSC-only module) directly rather than through next-unchecked, so the validation plugin above catches accidental client usage at build time.
