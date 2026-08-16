import { describe, expect, it } from 'vitest'

import { createOperationHooks } from '#/core/graphql/codegen/operation'

describe('createOperationHooks', () => {
  it('composes createQueryHook from createQueryHookFactory and spreads createOperationFnFactory', () => {
    const hooks = createOperationHooks({
      url: 'https://x/graphql',
    })
    expect(typeof hooks.createQueryHook).toBe('function')
    expect(typeof hooks.createMutationFn).toBe('function')
    expect(typeof hooks.createQueryFn).toBe('function')
  })

  it('produces independent factory sets per config (not a shared singleton)', () => {
    const a = createOperationHooks({
      url: 'https://a/graphql',
    })
    const b = createOperationHooks({
      url: 'https://b/graphql',
    })
    expect(a.createQueryHook).not.toBe(b.createQueryHook)
  })
})
