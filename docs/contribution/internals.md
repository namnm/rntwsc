<!-- START doctoc -->

- [Internals](#internals)
  - [Turbopack](#turbopack)
  - [Patching react-native-web](#patching-react-native-web)

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
