import { print } from 'graphql'
import { describe, expect, it, vi } from 'vitest'

import { createOperationFnFactory } from '#/core/graphql/codegen/fn'
import { getApolloClient } from '#/core/graphql/store'

const mutate = vi.fn()
const query = vi.fn()

vi.mock('#/core/graphql/store', () => ({
  getApolloClient: vi.fn(() => ({
    mutate,
    query,
  })),
}))

type Case = { id: string; tag: string; closed: boolean }

describe('createOperationFnFactory', () => {
  describe('createMutationFn', () => {
    it('builds a mutation document limited to the selected fields and unwraps the result', async () => {
      mutate.mockResolvedValue({
        data: {
          caseFile: {
            id: '1',
            tag: 'Pattern',
          },
        },
        error: undefined,
        extensions: {
          case: 'amber',
        },
      })
      const { createMutationFn } = createOperationFnFactory({
        url: 'https://x/graphql',
      })
      const caseFile = createMutationFn<Case, Case, { data: { tag: string } }>(
        'caseFile',
        [
          {
            name: 'data',
            graphqlType: 'CaseFile!',
          },
        ],
      )

      const r = await caseFile({
        variables: {
          data: {
            tag: 'Pattern',
          },
        },
        select: p => p.tag,
      })

      expect(getApolloClient).toHaveBeenCalledWith('https://x/graphql')
      expect(mutate).toHaveBeenCalledTimes(1)
      const call = mutate.mock.calls[0]![0]
      const printed = print(call.mutation)
      expect(printed).toContain('tag')
      expect(printed).not.toContain('closed')
      expect(call.variables).toEqual({
        data: {
          tag: 'Pattern',
        },
      })

      expect(r.data).toEqual({
        id: '1',
        tag: 'Pattern',
      })
      expect(r.extensions).toEqual({
        case: 'amber',
      })
    })

    it('resolves headers via resolveMutationHeaders and forwards them as context', async () => {
      mutate.mockResolvedValue({
        data: {
          caseFile: {
            id: '1',
          },
        },
      })
      const { createMutationFn } = createOperationFnFactory({
        url: 'x',
        resolveMutationHeaders: h => ({
          ...h,
          Authorization: 'Bearer amber',
        }),
      })
      const caseFile = createMutationFn<Case, Case, Record<string, never>>(
        'caseFile',
        [],
      )

      await caseFile({
        headers: {
          'x-division': 'fringe',
        },
      })

      const call = mutate.mock.calls.at(-1)![0]
      expect(call.context).toEqual({
        headers: {
          'x-division': 'fringe',
          Authorization: 'Bearer amber',
        },
      })
    })
  })

  describe('createQueryFn', () => {
    it('fetches network-only and unwraps the result, with no extensions field', async () => {
      query.mockResolvedValue({
        data: {
          caseLookup: {
            id: '1',
            tag: 'Pattern',
          },
        },
        error: undefined,
      })
      const { createQueryFn } = createOperationFnFactory({
        url: 'https://x/graphql',
      })
      const caseLookup = createQueryFn<Case, Case, { id: string }>(
        'caseLookup',
        [
          {
            name: 'id',
            graphqlType: 'String!',
          },
        ],
      )

      const r = await caseLookup({
        variables: {
          id: '1',
        },
        select: p => p.tag,
      })

      expect(query).toHaveBeenCalledTimes(1)
      const call = query.mock.calls[0]![0]
      expect(call.fetchPolicy).toBe('network-only')
      expect(print(call.query)).toContain('tag')

      expect(r.data).toEqual({
        id: '1',
        tag: 'Pattern',
      })
      expect(r.extensions).toBeUndefined()
    })
  })
})

// Type-only checks - the real assertion is whether the file typechecks, via
// `@ts-expect-error` on the lines that must fail to compile (see
// selector.test.ts's SelectedShape block for the same pattern).
describe('createOperationFnFactory typing', () => {
  it('narrows createMutationFn data to only the selected fields, plus auto keys', async () => {
    mutate.mockResolvedValue({
      data: {
        caseFile: {
          id: '1',
          tag: 'Pattern',
        },
      },
    })
    const { createMutationFn } = createOperationFnFactory({
      url: 'x',
    })
    const caseFile = createMutationFn<Case, Case, Record<string, never>>(
      'caseFile',
      [],
    )

    const r = await caseFile({
      select: p => p.tag,
    })
    void r.data?.tag
    void r.data?.id
    // @ts-expect-error - `closed` was not selected
    void r.data?.closed
    expect(true).toBe(true)
  })

  it('narrows createQueryFn data to only the selected fields', async () => {
    query.mockResolvedValue({
      data: {
        caseLookup: {
          id: '1',
          tag: 'Pattern',
        },
      },
    })
    const { createQueryFn } = createOperationFnFactory({
      url: 'x',
    })
    const caseLookup = createQueryFn<Case, Case, { id: string }>(
      'caseLookup',
      [],
    )

    const r = await caseLookup({
      variables: {
        id: '1',
      },
      select: p => p.tag,
    })
    void r.data?.tag
    // @ts-expect-error - `closed` was not selected
    void r.data?.closed
    expect(true).toBe(true)
  })
})
