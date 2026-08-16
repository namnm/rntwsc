<!-- START doctoc -->

- [Hydration](#hydration)
  - [Fetch](#fetch)
  - [GraphQL](#graphql)
  - [Multiple renderers of the same call: dedupe and keySalt](#multiple-renderers-of-the-same-call-dedupe-and-keysalt)
  - [Rendering dehydrateJsx](#rendering-dehydratejsx)
  - [Benefit: works the same across the initial load and a client navigation](#benefit-works-the-same-across-the-initial-load-and-a-client-navigation)
  - [Benefit: refetch works after hydration too](#benefit-refetch-works-after-hydration-too)
  - [When is a component actually interactive?](#when-is-a-component-actually-interactive)

<!-- END doctoc -->

# Hydration

useFetch and useFetchGraphQL fetch data once on the server, embed the result into the page, and the client picks it up with no second request and no loading flash. The same hook works as a plain fetch or as a GraphQL query, and the same call also works unmodified on a client navigation, where it just fetches normally.

## Fetch

```tsx
import { useFetch } from '#/core/fetch'

// server component (async) - fetches once per request, awaited before render
export const Users = async () => {
  const { data, error, dehydrateJsx } = await useFetch<User[]>({
    url: 'https://api.example.com/users',
  })
  return (
    <>
      {dehydrateJsx}
      <UserList users={data} />
    </>
  )
}
```

```tsx
'use client'
import { useFetch } from '#/core/fetch'

// client component - same hook, now interactive
export const UsersRefreshable = () => {
  const { data, loading, error, refetch } = useFetch<User[]>({
    url: 'https://api.example.com/users',
  })
  return (
    <>
      <UserList users={data} />
      <Pressable onPress={refetch}>
        <Text>{loading ? 'Loading...' : 'Refresh'}</Text>
      </Pressable>
    </>
  )
}
```

## GraphQL

```tsx
import { useFetchGraphQL } from '#/core/graphql'
import { GET_USERS } from './queries'

export const Users = async () => {
  const { data, error, dehydrateJsx } = await useFetchGraphQL({
    url: 'https://api.example.com/graphql',
    query: GET_USERS,
  })
  return (
    <>
      {dehydrateJsx}
      <UserList users={data?.data} />
    </>
  )
}
```

The client variant of useFetchGraphQL is a thin wrapper over Apollo's own useQuery, so it gets Apollo's cache, refetch, and error handling for free, in addition to picking up the server's result.

## Multiple renderers of the same call: dedupe and keySalt

By default, every useFetch/useFetchGraphQL call renders its own dehydrated `<template>` marker, even if another call elsewhere on the page has the exact same arguments - no sharing, no collision risk, at the cost of one marker per call instead of one per distinct query.

Call `initCache({ enableDedupe: true })` (from `rntwsc/cache/config`, once at app startup, same place as initTheme/initI18n) to opt into sharing: components calling useFetch/useFetchGraphQL with the exact same arguments then dedupe into a single dehydrated marker instead of one each, which is smaller but requires care - see the next paragraph.

Once dedupe is enabled, a Server Component and an async `'use client'` component fetching the exact same query need a `keySalt` to stay safe. They hydrate at different points in the page (see contribution/hydration.md), so sharing one marker between them can cause a transient hydration mismatch: whichever group didn't end up owning the shared marker races against it becoming available. Pass a `keySalt` (any string) to give a group of callers its own dehydration key instead of sharing one with another group:

```tsx
// server instance - no keySalt, this is the default group
const a = await useFetch<User[]>({ url })
```

```tsx
// 'use client' instance of the same url - own keySalt, own dehydration marker
'use client'
const b = await useFetch<User[]>({ url, keySalt: 'client' })
```

keySalt only affects the dehydration key - it is never sent in the actual request. With dedupe disabled (the default), keySalt is only useful if you want two groups to fetch independently instead of sharing one cached promise - see contribution/hydration.md#dehydration-key-collisions-and-keysalt for how the two interact.

## Rendering dehydrateJsx

Always render dehydrateJsx once, next to the data it belongs to. It renders nothing visible - on the server it embeds the fetched result into the page so the browser can read it back out; on a route that was not server rendered (reached by client navigation instead) it renders nothing at all, since there is nothing to embed.

## Benefit: works the same across the initial load and a client navigation

Next.js App Router navigates between pages on the client without a full reload. A page reached this way was never rendered on the server for this request, so there is nothing dehydrated for it - useFetch and useFetchGraphQL notice this automatically and just fetch normally on the client, the same way any client side data fetching hook would. No branching is needed in your component for "was this the first load or a client navigation" - the exact same code handles both:

- First load (server rendered): data is fetched once on the server, embedded in the page, and picked up instantly on the client with no extra request.
- Client navigation (not server rendered for this request): no embedded data exists, so the hook fetches it directly on the client, same as any other client side fetch.

## Benefit: refetch works after hydration too

refetch() is a no-op on the server (a Server Component render only happens once), but a real request on the client - a plain fetch for useFetch, Apollo's own refetch for useFetchGraphQL. This means the same component can show the server's initial result immediately, and still let the user manually refresh it afterward, without any extra wiring.

## When is a component actually interactive?

Server-rendered markup paints in the browser before React finishes hydrating it - event handlers for a Client Component are not attached until hydration reaches that part of the tree. Anything the user does in that gap (a click, a keystroke) is not guaranteed to be handled.

This matters most for controlled inputs (`TextInput`, `Input`, anything driven by a `value` prop): typing before hydration attaches `onChangeText` does not update React's controlled value, and once hydration mounts, React syncs the DOM back to whatever that value still is - silently discarding whatever was typed during the gap. The failure mode is exactly "typed text disappears, no error" rather than a crash, which makes it easy to miss until an automated test or a fast typist hits it.

There is currently no exposed signal for "hydration has reached this component and it is safe to interact with it" - no ref method, no custom event, no data attribute. If you need to wait for it (most commonly in end-to-end tests that type into a field immediately after navigation):

- Don't assume interactivity the instant markup appears in the DOM, even though it looks fully rendered.
- In Playwright (or similar), wait past `networkidle`, or add a short explicit delay, before the first interaction with a controlled input.
- Prefer asserting on an app-visible side effect of the input actually registering the keystroke (rather than firing-and-forgetting) if your test framework supports retrying assertions.

See contribution/hydration.md for how the dehydrate and rehydrate mechanism is implemented across server, browser, and native.
