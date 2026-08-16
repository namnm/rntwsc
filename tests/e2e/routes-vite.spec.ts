import { expect, test } from '@playwright/test'

import { routes } from './routes'

// Runs against a real production build (see playwright.config.ts's
// viteServer - `vite build` then `vite preview`, not `vite`'s dev server).
// Same "no console/page error" check as routes.spec.ts, kept as its own
// file (rather than reusing routes.spec.ts directly) since a plain client
// SPA has no SSR dehydration for hydration-data.spec.ts to check.
//
// Used to wrap every route in test.fail() - @react-navigation/native-stack,
// and then its own JS-based createStackNavigator alternative, both crashed
// in react-navigation's own shared rendering (a style prop shaped as a
// plain array reaching a raw DOM element unflattened) on every single
// route. Fixed by dropping react-navigation for this variant in favor of
// react-router - see playground/app/src/app.web.tsx and docs/todo.md issue
// 11/14 for the full writeup.
for (const route of routes) {
  test(`${route} loads with no console/page errors`, async ({ page }) => {
    const errs: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errs.push(msg.text())
      }
    })
    page.on('pageerror', err => {
      errs.push(`[pageerror] ${err.message}`)
    })
    const response = await page.goto(route, {
      waitUntil: 'networkidle',
    })
    expect(response?.ok()).toBe(true)
    await page.waitForTimeout(300)
    expect(errs).toEqual([])
  })
}
