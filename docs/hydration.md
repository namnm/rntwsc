<!-- START doctoc -->

- [Hydration](#hydration)
  - [Fetch](#fetch)
  - [GraphQL](#graphql)
  - [Rendering dehydrateJsx](#rendering-dehydratejsx)
  - [Benefit: works the same across the initial load and a client navigation](#benefit-works-the-same-across-the-initial-load-and-a-client-navigation)
  - [Benefit: refetch works after hydration too](#benefit-refetch-works-after-hydration-too)

<!-- END doctoc -->

# Hydration

useFetch and useApollo fetch data once on the server, embed the result into the page, and the client picks it up with no second request and no loading flash. The same hook works as a plain fetch or as a GraphQL query, and the same call also works unmodified on a client navigation, where it just fetches normally.

## Fetch

```tsx
import { useFetch } from '@/core/fetch'

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
import { useFetch } from '@/core/fetch'

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
import { useApollo } from '@/core/graphql'
import { GET_USERS } from './queries'

export const Users = async () => {
  const { data, error, dehydrateJsx } = await useApollo({
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

The client variant of useApollo is a thin wrapper over Apollo's own useQuery, so it gets Apollo's cache, refetch, and error handling for free, in addition to picking up the server's result.

## Rendering dehydrateJsx

Always render dehydrateJsx once, next to the data it belongs to. It renders nothing visible - on the server it embeds the fetched result into the page so the browser can read it back out; on a route that was not server rendered (reached by client navigation instead) it renders nothing at all, since there is nothing to embed.

## Benefit: works the same across the initial load and a client navigation

Next.js App Router navigates between pages on the client without a full reload. A page reached this way was never rendered on the server for this request, so there is nothing dehydrated for it - useFetch and useApollo notice this automatically and just fetch normally on the client, the same way any client side data fetching hook would. No branching is needed in your component for "was this the first load or a client navigation" - the exact same code handles both:

- First load (server rendered): data is fetched once on the server, embedded in the page, and picked up instantly on the client with no extra request.
- Client navigation (not server rendered for this request): no embedded data exists, so the hook fetches it directly on the client, same as any other client side fetch.

## Benefit: refetch works after hydration too

refetch() is a no-op on the server (a Server Component render only happens once), but a real request on the client - a plain fetch for useFetch, Apollo's own refetch for useApollo. This means the same component can show the server's initial result immediately, and still let the user manually refresh it afterward, without any extra wiring.

See contribution/hydration.md for how the dehydrate and rehydrate mechanism is implemented across server, browser, and native.
