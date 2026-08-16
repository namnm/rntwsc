import { describe, expect, it } from 'vitest'

import { shouldClearHydrationErrBrowser } from '#/core/graphql/index.browser' // eslint-disable-line custom/no-import-invalid-variant

// Regression tests for docs/todo.md issue 18: hydrationErr (the parallel
// error store for the original SSR-dehydrated result) used to only clear on
// our own refetch() - an automatic Apollo refetch (polling, cache
// invalidation, network reconnect) that succeeded left it set forever.
describe('shouldClearHydrationErrBrowser', () => {
  it('clears once a request finishes with no error, regardless of what triggered it', () => {
    expect(shouldClearHydrationErrBrowser(true, false, false)).toBe(true)
  })

  it('does not clear while still loading', () => {
    expect(shouldClearHydrationErrBrowser(true, true, false)).toBe(false)
  })

  it('does not clear when the request that just finished still has an error', () => {
    expect(shouldClearHydrationErrBrowser(true, false, true)).toBe(false)
  })

  it('does not fire on the initial mount, where wasLoading and isLoading start equal', () => {
    // mirrors useFetchGraphQL's wasLoadingRef, initialized from the same
    // r.loading value the first effect run also sees
    expect(shouldClearHydrationErrBrowser(false, false, false)).toBe(false)
    expect(shouldClearHydrationErrBrowser(true, true, false)).toBe(false)
  })
})
