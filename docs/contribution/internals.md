# Internals

## Turbopack

Currently webpack-only. Turbopack uses ESM and a unified RSC graph for all environments, which conflicts with React Native's CommonJS requirement. Supporting it would require:

- Prebuilt CommonJS for all packages
- CSS theme variables generated in a build step
- `resolveAlias` glob for all `.client` extension files in next config
- Rebuild CSS or restart Next.js when adding/removing `.client` files

Turbopack also has known issues with bundle chunk sizes. Not recommended for now.

## Patching react-native-web

Default `react-native-web` limitations:

- Styles are runtime-generated and injected into `<head>`, overriding Tailwind CSS
- SSR style extraction is incompatible with Next.js App Router streaming
- `className` is stripped from props

**Patch approach**: Patch the following components to accept `className` and use a computed class name strategy instead of RN StyleSheet: `Text`, `View`, `ScrollView`, `Pressable`, `TextInput`, `FlatList`. These are also exported with Reanimated support.

Changes made:

- Add `rnwTag`, `rnwClassNameData`, `className` to `forwardedProps`
- Update `createElement` to use `rnwTag`
- Add `rnwClassNameData` to each patched component
- Update `createDOMProps` to call a global `rnwClassName` function (injected in `packages/rn/core/polyfill/react-native-web.ts` - functions cannot be passed as props in RSC streaming)

Props prefixed `data-` are merged into `dataSet` (react-native-web only supports `dataSet`).
