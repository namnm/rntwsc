<!-- START doctoc -->

- [Hydration implementation](#hydration-implementation)
  - [Hydration key](#hydration-key)
  - [Server: fetch, cache, and embed](#server-fetch-cache-and-embed)
  - [Browser: scan, store, and match](#browser-scan-store-and-match)
  - [Browser hooks: read first, fetch only on a miss](#browser-hooks-read-first-fetch-only-on-a-miss)
  - [Why dehydrate.tsx has no variant of its own](#why-dehydratetsx-has-no-variant-of-its-own)
  - [Native](#native)

<!-- END doctoc -->

# Hydration implementation

See hydration.md for the consumer-facing usage and benefits. This doc covers how the dehydrate and rehydrate mechanism used by useFetch and useFetchGraphQL actually works, across server, browser, and native.

## Hydration key

packages/core/hydration/config.ts's hydrationKey builds a deterministic string key from a plain object plus a type discriminator, using jsonStable so key order never changes the result. packages/core/fetch/config.ts and packages/core/graphql/config.ts each call it with their own shape (url and headers for fetch; url, query, variables, and headers for graphql). The server hook and the browser hook both compute this same key from the same call arguments, which is what lets the browser find the exact server result that belongs to a given call, with nothing more than the call's own arguments.

## Server: fetch, cache, and embed

packages/core/fetch/index.ts and packages/core/graphql/index.ts are async, server-only hooks. Each computes its hydration key, then looks it up in a Map kept in serverCache (scoped to the current request, so multiple components requesting the same key within one render share a single in-flight promise instead of firing duplicate requests). The result, a plain data or error object, is passed to dehydrate(), shared by all three variants (packages/core/hydration/dehydrate.tsx).

dehydrate() always returns loading false, a refetch, and the raw data or error, plus a dehydrateJsx element on web. That element (Dehydrate, rendering DehydrateTemplate) writes a template tag holding the key and a JSON serialized value as attributes, not a script tag, following React's own recommendation for embedding data that should not execute. A per-request Set (dehydrated(), also scoped through serverCache when isServer) guards against embedding the same key twice if more than one component asks for the same data in the same render.

## Browser: scan, store, and match

packages/core/hydration/store.ts runs once when its module loads in a real browser (guarded by isBrowser): it scans the DOM for every template tag carrying the dehydration attributes, parses each one's JSON value, and puts it into a small in-memory store keyed by the same hydration key, marking each key as rehydrated. This store is the single source every feature drains from - it holds raw HydrationData, not anything fetch or graphql specific.

packages/core/fetch/store.ts and packages/core/graphql/store.ts each keep their own separate in-memory store (a plain useSyncExternalStore-backed object for fetch; Apollo's own InMemoryCache plus a small parallel error store for graphql, since Apollo cache cannot hold errors). Both call drainHydration on module load (also isBrowser-guarded) to pull every entry belonging to their own hydration key type out of the shared store and into their own: fetch copies the raw value in as-is, graphql calls the Apollo client's writeQuery so useQuery resolves from cache immediately, and any GraphQL or HTTP error is kept in the parallel error store instead, surfaced through useHydrationErr.

## Browser hooks: read first, fetch only on a miss

packages/core/fetch/index.browser.ts and packages/core/graphql/index.browser.ts compute the identical hydration key from their own call arguments and read straight from their own store (useFetchData, or Apollo's useQuery against the cache that was just pre-populated). If the key matches something that was dehydrated, the value is there synchronously on first render, no request happens. If nothing matches (a route reached by client navigation, never rendered on the server for this request), the value is missing, and each hook's own effect fires a real request the normal client side way - a plain fetch for useFetch, Apollo's own network request for useQuery.

refetch() only does real work on the client: useFetch's browser variant issues a plain fetch and writes the result back into its own store; useFetchGraphQL's browser variant clears its own hydration error entry first, then calls Apollo's own refetch. The server variant's refetch is a no-op, since a Server Component render only ever happens once per request.

## Why dehydrate.tsx has no variant of its own

Unlike the hooks themselves, packages/core/hydration/dehydrate.tsx is not split into server, browser, and native files - the same module is imported by both index.ts (server) and index.browser.ts (browser). Its behavior branches at runtime instead, using isServer and isWeb (from packages/core/platform), which read typeof window rather than anything decided at build time. This matters because a Client Component's own SSR pass also has no window (Next.js executes the client bundle's code in Node for the initial render before hydration), so isServer is true there too - dehydrate() called from the browser variant during that pass would try to embed a template, but only ever does so if it already has a value, and a Client Component's own data-fetching effect never runs during SSR, so its own v stays undefined and nothing gets embedded. Only the genuinely async, awaited server hook ever has a value by render time, so only it actually produces a dehydrated template in practice.

## Native

packages/core/fetch/index.native.ts and packages/core/graphql/index.native.ts are currently plain re-exports of the browser variant - there is no dehydration to read on native (no server-rendered HTML to scan), so every call always falls through to the browser hook's own fetch effect. See docs/todo.md for the open native-specific work (offline cache, background fetch, and so on) this stub is standing in for.
