# RSC + SSR

## Browser extension

Works like Metro's `.native`/`.ios`/`.android` - but for the browser bundle. A Babel plugin (`babel-plugin-browser-extension`) and webpack plugin (`webpack-resolve-browser-extension`) rewrite import paths: `./foo` -> `./foo.browser` when a `.browser` file exists.

To bypass Next.js RSC metadata validation (which runs before Babel), `next/..` imports are aliased to `next-unchecked/..`. `babel-plugin-rsc-validation` handles those checks instead.

**Cache gotcha**: adding or removing a `.browser` file requires deleting `.next/` and restarting the dev server - the transpiled path gets cached.

**Export parity**: a custom ESLint rule `custom/no-missing-export` checks that each variant exports the same names as the default. To intentionally allow a variant-only export, suffix its name with the variant (e.g. `somethingNative` in `.native`).

**No `.web.browser`**: only `.browser` is supported. Default = server (broadest), then `.browser`, then `.native`.

## Async components

Async components are transpiled to sync for browser and native bundles. Only async components that call `await use..` hooks are affected:

```tsx
// source (server)
import { useTranslation } from '@/i18n'
export const Hello = async () => {
  const t = await useTranslation('common')
  return <Text>{t('hello')}</Text>
}

// transpiled (browser / native) - import path rewritten to .browser variant
import { useTranslation } from '@/i18n/index.browser'
export const Hello = () => {
  const t = useTranslation('common')
  return <Text>{t('hello')}</Text>
}
```
