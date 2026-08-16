// Derived from the real route-paths.ts, not a hand-kept duplicate - a
// relative import (not the @/ alias, which Playwright's transform does not
// resolve) works fine since route-paths.ts has zero imports of its own.
import * as routePaths from '../../playground/app/src/pages/route-paths'

export const routes = Object.values(routePaths)

// zh-CN (LTR, non-default) and ar-AE (RTL) - see
// playground/app/src/i18n/config.ts's `languages`.
export const nonDefaultLocales = ['zh-CN', 'ar-AE']
