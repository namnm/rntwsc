<!-- START doctoc -->

- [Internals](#internals)
  - [Turbopack](#turbopack)
  - [Patching react-native-web](#patching-react-native-web)
  - [globalStore](#globalstore)
  - [GraphQL codegen](#graphql-codegen)
  - [Custom ESLint rules](#custom-eslint-rules)

<!-- END doctoc -->

# Internals

## Turbopack

Available as a selectable option alongside webpack, for both next dev and next build (see contribution/turbopack.md for full technical detail). Packages are consumed directly from ts source via tsconfig path aliases in the dev and build path used by playground/turbopack - no prebuilt CommonJS step is required. Browser variant resolution and CSS theme variable extraction are both wired through Turbopack's resolveAlias and rules config.

Restarting Next.js is still required when adding or removing a browser file - the glob that finds them is computed once at config load time, same limitation webpack already had.

## Patching react-native-web

Default react-native-web limitations:

- Styles are runtime-generated and injected into head, overriding Tailwind CSS
- SSR style extraction is incompatible with Next.js App Router streaming
- className is stripped from props

Patch approach: patch the following components to accept className and use a computed class name strategy instead of the RN StyleSheet: Text, View, ScrollView, Pressable, TextInput, FlatList. These are also exported with Reanimated support.

Changes made:

- Add rnwTag, rnwClassNameData, and className to forwardedProps
- Update createElement to use rnwTag
- Add rnwClassNameData to each patched component
- Update createDOMProps to call a global rnwClassName function, injected in packages/core/tw/polyfill/react-native-web.ts (functions cannot be passed as props in RSC streaming)

Props prefixed with data- are merged into dataSet (react-native-web only supports dataSet).

## globalStore

packages/core/utils/global-store.ts keys mutable module state off `globalThis` instead of a plain module-level variable. A bundler that code-splits the calling client module into more than one chunk (Turbopack can do this) would otherwise give each chunk its own disconnected copy of that state - a `useSyncExternalStore` subscriber registered through one chunk's copy would never see a write made through another. Reading and writing a `globalThis` property instead guarantees every chunk shares the same value, since there is only one `globalThis` per JS realm no matter how many times the module's top-level code is re-evaluated.

Used by dark-mode, theme, responsive/use-safe-area, and components/portal/store. Keys must be prefixed (e.g. `__rntwscFoo`) since `globalThis` is a single shared namespace, unlike a module scope.

## GraphQL codegen

packages/core/graphql/codegen/selector.ts builds a type-safe field-selection DSL. The `Selector<T, Acc>` type accumulates selected fields into `Acc` as each field access folds the key in and drops it from the remaining selector, so selecting the same field twice is a type error. An expandable field (a relation, or a list of them) also exposes a call-signature sub-selector; its own `Acc` is threaded back through `ReplaceItem` so the parent field keeps the original array/nullable wrapper.

`SelectedShape<T, S>` pulls the accumulated `Acc` back out of a select callback's return type `S`. `S` is wrapped as `[S] extends [never]` rather than a bare `S extends never`, since a bare check on a generic `S` is a distributive conditional type and would evaluate per union member instead of once - the `[ ]` wrapping opts out of that.

## Custom ESLint rules

Rules live in packages/devtools/eslint-plugin-custom.

no-unicode-chars: the non-fixable pattern (report only, no ASCII replacement exists) covers these Unicode ranges:

- Arrows: 2190-21FF, supplemental arrows A 27F0-27FF, supplemental arrows B 2900-297F
- Geometric shapes: 25B2-25BF, 25C6-25C8, 25CA, 2666
- Check marks: 2713, 2714
- Emoji: 1F300-1F9FF, 1FA00-1FAFF
- Misc symbols: 2600-26FF, dingbats 2700-27BF
