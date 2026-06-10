# RSC + SSR

## Client extension

Works like Metro's `.native`/`.ios`/`.android` - but for the client bundle. A Babel plugin (`babel-plugin-client-extension`) and webpack plugin (`webpack-resolve-client-extension`) rewrite import paths: `./foo` -> `./foo.client` when a `.client` file exists.

To bypass Next.js RSC metadata validation (which runs before Babel), `next/..` imports are aliased to `next-unchecked/..`. `babel-plugin-rsc-validation` handles those checks instead.

**Cache gotcha**: adding or removing a `.client` file requires deleting `.next/` and restarting the dev server - the transpiled path gets cached.

**Export parity**: a custom ESLint rule `custom/no-missing-export` checks that each variant exports the same names as the default. To intentionally allow a variant-only export, suffix its name with the variant (e.g. `somethingNative` in `.native`).

**No `.web.client`**: only `.client` is supported. Default = server (broadest), then `.client`, then `.native`.

## Async components

Async components are transpiled to sync for client and native bundles. Only async components that call `await use..` hooks are affected:

```tsx
// source (server)
import { useTranslation } from '@/i18n'
export const Hello = async () => {
  const t = await useTranslation('common')
  return <Text>{t('hello')}</Text>
}

// transpiled (client / native) - import path rewritten to .client variant
import { useTranslation } from '@/i18n/index.client'
export const Hello = () => {
  const t = useTranslation('common')
  return <Text>{t('hello')}</Text>
}
```

## Context

Avoid global React Context - it marks all children as client components and defeats RSC streaming.

| Bundle | Strategy                                                                    |
| ------ | --------------------------------------------------------------------------- |
| Server | Async methods: `next/headers`, `fetch`, etc.                                |
| Client | Same export shape via `next/navigation`, singletons, `useSyncExternalStore` |
| Native | React Context is fine; add Provider at the native entry point               |
