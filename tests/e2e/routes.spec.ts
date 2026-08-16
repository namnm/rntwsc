import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

import { nonDefaultLocales, routes } from './routes'

// Runs against a real production build (see playwright.config.ts's
// webServer) - navigates every playground route and fails on any console
// error or uncaught page error, which is how React reports hydration
// mismatches (e.g. "Hydration failed because the initial UI does not match
// what was rendered on the server", minified as error #418/#425/#421 in a
// production build). No string-matching on "hydrat*" specifically - any
// console.error is worth surfacing, which is a strictly stronger bar.
const collectErrs = (page: Page) => {
  const errs: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errs.push(msg.text())
    }
  })
  page.on('pageerror', err => {
    errs.push(`[pageerror] ${err.message}`)
  })
  return errs
}

// /graphql used to have a consistently-reproducible transient hydration
// mismatch (React error #418) - fixed by giving GraphQLClient's useFetchHello
// call a distinct `keySalt` (see packages/core/graphql/config.ts's
// UseApollo.keySalt). Root cause: GraphQLServer and GraphQLClient both
// resolved to the exact same dehydration key (identical url/query/variables,
// no differentiator), so DehydrateTemplate's dedup-by-key logic emitted only
// ONE <template> marker in the HTML, attached to whichever instance rendered
// first on the server (a GraphQLServer). GraphQLClient's own hydration point
// - on a different timing than GraphQLServer's, since it goes through
// packages/devtools/babel-plugin-async-hook's rsc/ssr splitting - could race
// past the point where that one shared marker's data was available. Same
// pattern rntwsc/fetch already avoided via its `?client=true` url suffix on
// the client variant (see playground/app/src/pages/fetch/fetch-client.tsx) -
// graphql/config.ts's keySalt is the same idea without hijacking url's
// semantics for a GraphQL endpoint that is genuinely one url.
const knownFailingRoutes = new Set<string>([])

for (const route of routes) {
  const t = knownFailingRoutes.has(route) ? test.fail : test
  t(
    `default locale: ${route} loads with no console/page errors`,
    async ({ page }) => {
      const errs = collectErrs(page)
      const response = await page.goto(route, {
        waitUntil: 'networkidle',
      })
      expect(response?.ok()).toBe(true)
      // give any async post-hydration effect a moment to fire before asserting
      await page.waitForTimeout(300)
      expect(errs).toEqual([])
    },
  )
}

// Spot-check hydration across both a non-default LTR locale and the RTL
// locale on a representative subset of routes, rather than the full matrix
// (3 locales x 22 routes) - locale switching mainly affects direction/text
// resolution (see docs/hydration.md), which these routes exercise
// sufficiently without tripling total run time for marginal extra coverage.
const localeSpotCheckRoutes = ['/', '/button', '/text-input', '/select']

for (const locale of nonDefaultLocales) {
  for (const route of localeSpotCheckRoutes) {
    test(`${locale} locale: ${route} loads with no console/page errors`, async ({
      page,
    }) => {
      const errs = collectErrs(page)
      const localizedPath = route === '/' ? `/${locale}` : `/${locale}${route}`
      const response = await page.goto(localizedPath, {
        waitUntil: 'networkidle',
      })
      expect(response?.ok()).toBe(true)
      await page.waitForTimeout(300)
      expect(errs).toEqual([])
    })
  }
}
