import { expect, test } from '@playwright/test'

// routes.spec.ts's per-route sweep only asserts "no console/page error" -
// strong enough to have caught the /graphql dehydration-key-collision bug
// (it threw React error #418), but it would not catch a silent variant of
// the same bug class: an instance quietly stuck on its loading/!data branch
// instead of the server's dehydrated value, with no error thrown at all.
// These two tests assert the actual rendered content instead, so a future
// regression that regresses data (not just errors) also gets caught.
//
// /graphql and /fetch each mount 3 server + 3 client instances of the same
// call (see playground/app/src/pages/graphql/index.tsx and
// playground/app/src/pages/fetch/index.tsx) - GraphQLUi/FetchUi only ever
// render "message:"/"timestamp:" once data is actually present, never while
// loading or on a missing-data fallback (see graphql-ui.tsx/fetch-ui.tsx).

test('/graphql: all 6 server/client instances resolve real data, none stuck on loading or !data', async ({
  page,
}) => {
  const response = await page.goto('/graphql', {
    waitUntil: 'networkidle',
  })
  expect(response?.ok()).toBe(true)
  await page.waitForTimeout(300)

  const body = await page.locator('body').innerText()
  expect(body.match(/message:/g)?.length).toBe(6)
  expect(body.match(/timestamp:/g)?.length).toBe(6)
  expect(body).not.toContain('!data')
  expect(body).not.toContain('loading..')
})

test('/fetch: all 6 server/client instances resolve real data, none stuck on loading', async ({
  page,
}) => {
  const response = await page.goto('/fetch', {
    waitUntil: 'networkidle',
  })
  expect(response?.ok()).toBe(true)
  await page.waitForTimeout(300)

  const body = await page.locator('body').innerText()
  expect(body.match(/message:/g)?.length).toBe(6)
  expect(body.match(/timestamp:/g)?.length).toBe(6)
  expect(body).not.toContain('loading..')
})
