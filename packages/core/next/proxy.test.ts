import { describe, expect, it, vi } from 'vitest'

import { createProxy } from '#/core/next/proxy'

// createProxy checks isStaticAsset before touching any locale/cookie
// state, so a minimal request stub is enough - real locale detection
// never runs for these paths.
const fakeRequest = (pathname: string) =>
  ({
    url: `http://localhost${pathname}`,
    nextUrl: {
      pathname,
      search: '',
    },
    cookies: {
      get: () => undefined,
    },
    headers: new Headers(),
  }) as any

describe('createProxy', () => {
  it('passes public/ static asset requests through untouched, not rewritten to a locale prefix', () => {
    const next = vi.fn(init => ({
      init,
    }))
    const Response = {
      next,
      redirect: vi.fn(),
      rewrite: vi.fn(),
    } as any
    const proxy = createProxy(Response)

    for (const pathname of [
      '/favicon.ico',
      '/models/olivia.glb',
      '/bg.mp4',
      '/models/VRMA_01.vrma',
    ]) {
      next.mockClear()
      proxy(fakeRequest(pathname))
      expect(next).toHaveBeenCalledTimes(1)
      expect(Response.redirect).not.toHaveBeenCalled()
      expect(Response.rewrite).not.toHaveBeenCalled()
    }
  })

  it('still passes /_next/ requests through untouched', () => {
    const next = vi.fn(init => ({
      init,
    }))
    const Response = {
      next,
      redirect: vi.fn(),
      rewrite: vi.fn(),
    } as any
    const proxy = createProxy(Response)

    proxy(fakeRequest('/_next/static/chunks/main.js'))
    expect(next).toHaveBeenCalledTimes(1)
  })
})
