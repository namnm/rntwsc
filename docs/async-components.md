# Async components

Async components are transpiled to sync for browser and native bundles. Only async components that call an await use.. hook are affected:

```tsx
// source (server)
import { useTranslation } from '@/core/i18n'
export const Hello = async () => {
  const t = await useTranslation('common')
  return <Text>{t('hello')}</Text>
}

// transpiled (browser or native) - import path rewritten to the matching variant
import { useTranslation } from '@/core/i18n/index.browser'
export const Hello = () => {
  const t = useTranslation('common')
  return <Text>{t('hello')}</Text>
}
```

This is what lets a component be written once, as an async Server Component, and still work as a plain synchronous Client Component or React Native component - the same source compiles differently per platform, following the same use.. hook it already calls (see browser-variant.md for how each hook's own browser or native file is chosen). See hydration.md for how data fetching hooks (useFetch, useApollo) use this to fetch once on the server and pick the same data back up on the client without a second request.
