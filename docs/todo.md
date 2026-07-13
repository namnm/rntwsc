# TODO

## Tooling

### create-rntwsc-app

A package similar to create-next-app or the React Native CLI's init command, that scaffolds a new
project from this framework instead of copying playground/app and playground/turbopack by hand.
Should set up the workspace layout, tsconfig path aliases, babel and next config wiring, and a
starter page for both web and native, so a new project gets a working dev setup in one command.

## Hydration / Core

### Native: split index.native.ts into its own implementation

Right now index.native.ts in both core/fetch and core/graphql is just a stub re-export of the browser code.
Native may eventually need:

- Offline cache (MMKV / AsyncStorage)
- Re-fetch on app focus / network reconnect
- Background fetch
- Push notification invalidation

Once native needs any of this behavior, it needs its own file instead of a re-export.

### Request cancellation / race condition

useFetch and useApollo do not cancel a pending request when:

- The component unmounts while a fetch is in flight
- The URL or variables change before the previous request finishes

The old request's result still gets set into the store, which can overwrite newer data.

Fix direction: use AbortController in useFetch, use Apollo's own refetch cancel semantics.
Scope: packages/core/fetch/index.browser.ts, packages/core/graphql/index.browser.ts.

### Apollo auto-refetch does not clear hydrationErr

clearHydrationErr is only called when the user manually clicks refetch. If Apollo refetches on its
own (polling, cache invalidation, network recovery) and succeeds, hydrationErr stays set - the
consumer sees fresh data but the err field is still shown.

Fix direction: subscribe to Apollo's client.watchQuery observable to detect when Apollo has a new
result that did not come from our own refetch(). Or: clear hydrationErr when r.loading goes from
true to false and r.data changes.
Scope: packages/core/graphql/index.browser.ts, packages/core/graphql/store.ts.
