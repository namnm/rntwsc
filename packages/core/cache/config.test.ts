import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getEnableDedupe, initCache } from '#/core/cache/config'

describe('cache config', () => {
  // reading the getter before any initCache call (the very first test below)
  // is the exact scenario under test here, not a misuse - but it trips
  // initSingleton's dev-mode "called out of order" check for every
  // initCache call in this file from then on, since that check has no way
  // to know this file is doing it on purpose. See utils/init-singleton.ts.
  let errSpy: ReturnType<typeof vi.spyOn>
  beforeEach(() => {
    errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  })
  afterEach(() => {
    // reset to the documented default so tests do not leak into each other
    initCache()
    errSpy.mockRestore()
  })

  it('defaults to dedupe disabled without calling initCache', () => {
    expect(getEnableDedupe()).toBe(false)
  })

  it('initCache({}) resets to the default (disabled)', () => {
    initCache({
      enableDedupe: true,
    })
    initCache({})
    expect(getEnableDedupe()).toBe(false)
  })

  it('enables dedupe once initCache is called with enableDedupe: true', () => {
    initCache({
      enableDedupe: true,
    })
    expect(getEnableDedupe()).toBe(true)
  })
})
