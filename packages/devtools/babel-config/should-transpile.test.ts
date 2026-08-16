import { describe, expect, it } from 'vitest'

import { shouldTranspile } from '#/devtools/babel-config/should-transpile'

describe('shouldTranspile', () => {
  it('returns false for a falsy filename', () => {
    expect(shouldTranspile(undefined)).toBe(false)
    expect(shouldTranspile('')).toBe(false)
  })

  it('transpiles a plain .ts/.tsx file inside the repo', () => {
    expect(
      shouldTranspile('/repo/packages/core/components/button/index.tsx'),
    ).toBe(true)
    expect(shouldTranspile('/repo/packages/core/utils/foo.ts')).toBe(true)
  })

  it('does not transpile a non-.ts(x) file', () => {
    expect(shouldTranspile('/repo/packages/core/tw/styles.scss')).toBe(false)
    expect(shouldTranspile('/repo/README.md')).toBe(false)
  })

  it('does not transpile a third-party package inside node_modules', () => {
    expect(shouldTranspile('/repo/node_modules/react/index.tsx')).toBe(false)
  })

  it('does transpile the published rntwsc package even inside node_modules', () => {
    expect(
      shouldTranspile('/repo/node_modules/rntwsc/components/button/index.tsx'),
    ).toBe(true)
  })
})
