import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// routes.spec.ts only ever reaches a route via page.goto() - a fresh SSR
// load with its own dehydration payload. /fetch and /graphql specifically
// can behave differently when reached via client-side navigation instead,
// since the page navigated into has no SSR response of its own to hydrate
// from - see docs/hydration.md and the /graphql keySalt writeup in
// routes.spec.ts. Not run against vite (see routes-vite.spec.ts) - a plain
// client SPA has no SSR dehydration payload for either path to diverge on.
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

test('client-side navigation into /fetch then /graphql renders with no console/page errors', async ({
  page,
}) => {
  const errs = collectErrs(page)
  const response = await page.goto('/', {
    waitUntil: 'networkidle',
  })
  expect(response?.ok()).toBe(true)

  await page.click('a[href="/fetch"]')
  await page.waitForURL('**/fetch')
  await page.waitForTimeout(300)

  await page.click('a[href="/graphql"]')
  await page.waitForURL('**/graphql')
  await page.waitForTimeout(300)

  expect(errs).toEqual([])
})
