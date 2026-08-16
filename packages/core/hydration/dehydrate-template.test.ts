import { describe, expect, it } from 'vitest'

import { shouldEmbedTemplate } from '#/core/hydration/dehydrate-template'

// Regression test for the production hydration mismatch (React error #418)
// documented in contribution/hydration.md and docs/todo.md issue 6/21:
// dedupe picks a "winner" instance independently on the server (one Set per
// request, covering every instance) and in the browser (one Set per page
// load, covering only the instances that actually hydrate) - when a Server
// Component and a Client Component share a key, the server's winner can be
// the Server Component instance, which never hydrates, so no Client
// Component instance's own SSR output and hydration output are guaranteed
// to agree.
describe('shouldEmbedTemplate', () => {
  it('enableDedupe=true, same key, no salt: the losing SSR instance can still win on hydration (the bug)', () => {
    const k = 'shared-key'

    // SSR: two instances share one dedupe Set, as serverCache scopes it per
    // request, not per instance - only the first to render wins.
    const ssrDedupeSet = new Set<string>()
    const ssrWinner = shouldEmbedTemplate({
      k,
      dedupeSet: ssrDedupeSet,
      enableDedupe: true,
      isBrowser: false,
      rehydratedSet: new Set(),
    })
    const ssrLoser = shouldEmbedTemplate({
      k,
      dedupeSet: ssrDedupeSet,
      enableDedupe: true,
      isBrowser: false,
      rehydratedSet: new Set(),
    })
    expect(ssrWinner).toBe(true)
    expect(ssrLoser).toBe(false)

    // Browser: only the Client Component instance (the SSR loser here)
    // actually hydrates, with its own fresh, page-lifetime dedupe Set - it
    // never sees that it already lost on the server.
    const rehydratedSet = new Set([k])
    const browserDedupeSet = new Set<string>()
    const hydrateOfLoser = shouldEmbedTemplate({
      k,
      dedupeSet: browserDedupeSet,
      enableDedupe: true,
      isBrowser: true,
      rehydratedSet,
    })

    // the SSR output for this instance was null, but hydration renders a
    // real <template> - a genuine SSR/client output mismatch
    expect(hydrateOfLoser).not.toBe(ssrLoser)
  })

  it('enableDedupe=true, distinct keySalt per group: the hydrating group stays consistent between SSR and hydration', () => {
    const serverKey = 'shared-key|server'
    const clientKey = 'shared-key|client'

    const ssrDedupeSet = new Set<string>()
    shouldEmbedTemplate({
      k: serverKey,
      dedupeSet: ssrDedupeSet,
      enableDedupe: true,
      isBrowser: false,
      rehydratedSet: new Set(),
    })
    const ssrClient = shouldEmbedTemplate({
      k: clientKey,
      dedupeSet: ssrDedupeSet,
      enableDedupe: true,
      isBrowser: false,
      rehydratedSet: new Set(),
    })

    const rehydratedSet = new Set([serverKey, clientKey])
    const hydrateClient = shouldEmbedTemplate({
      k: clientKey,
      dedupeSet: new Set(),
      enableDedupe: true,
      isBrowser: true,
      rehydratedSet,
    })

    expect(hydrateClient).toBe(ssrClient)
  })

  it('enableDedupe=false: SSR and hydration always agree, even on a shared key', () => {
    const k = 'shared-key'
    const rehydratedSet = new Set([k])

    const ssr = shouldEmbedTemplate({
      k,
      dedupeSet: new Set(),
      enableDedupe: false,
      isBrowser: false,
      rehydratedSet: new Set(),
    })
    const hydrate = shouldEmbedTemplate({
      k,
      dedupeSet: new Set(),
      enableDedupe: false,
      isBrowser: true,
      rehydratedSet,
    })

    expect(ssr).toBe(true)
    expect(hydrate).toBe(true)
  })

  it('browser: never embeds a key the server never dehydrated, regardless of enableDedupe', () => {
    const withDedupe = shouldEmbedTemplate({
      k: 'unseen-key',
      dedupeSet: new Set(),
      enableDedupe: true,
      isBrowser: true,
      rehydratedSet: new Set(),
    })
    const withoutDedupe = shouldEmbedTemplate({
      k: 'unseen-key',
      dedupeSet: new Set(),
      enableDedupe: false,
      isBrowser: true,
      rehydratedSet: new Set(),
    })
    expect(withDedupe).toBe(false)
    expect(withoutDedupe).toBe(false)
  })
})
