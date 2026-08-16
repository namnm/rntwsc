import { print } from 'graphql'
import { describe, expect, it, vi } from 'vitest'

import { useFetchGraphQL } from '#/core/graphql'
import { createQueryHookFactory } from '#/core/graphql/codegen/hook'

vi.mock('#/core/graphql', () => ({
  useFetchGraphQL: vi.fn(),
}))

const mockedFetch = vi.mocked(useFetchGraphQL)

type Case = { id: string; tag: string; severity: number }

describe('createQueryHookFactory', () => {
  it('builds a document limited to the selected fields and normalizes the result', async () => {
    mockedFetch.mockResolvedValue({
      data: {
        data: {
          caseSearch: {
            id: '1',
            tag: 'Pattern',
          },
        },
        errors: undefined,
      },
      error: undefined,
      loading: false,
      refetch: vi.fn(),
      dehydrateJsx: null,
    })

    const createQueryHook = createQueryHookFactory({
      url: 'https://x/graphql',
    })
    const useFetchCaseSearch = createQueryHook<
      'caseSearch',
      Case,
      Case,
      Record<string, never>
    >('caseSearch', [])

    const r = await useFetchCaseSearch({
      select: p => p.tag,
    })

    expect(mockedFetch).toHaveBeenCalledTimes(1)
    const call = mockedFetch.mock.calls[0]![0]
    expect(call.url).toBe('https://x/graphql')
    const printed = print(call.query)
    expect(printed).toContain('tag')
    expect(printed).not.toContain('severity')

    expect(r.data).toEqual({
      id: '1',
      tag: 'Pattern',
    })
    expect(r.loading).toBe(false)
  })

  it('merges headers resolved via useQueryHeaders on top of the caller-supplied ones', async () => {
    mockedFetch.mockResolvedValue({
      data: undefined,
      error: undefined,
      loading: false,
      refetch: vi.fn(),
      dehydrateJsx: null,
    })
    const createQueryHook = createQueryHookFactory({
      url: 'x',
      useQueryHeaders: async h => ({
        ...h,
        Authorization: 'Bearer amber',
      }),
    })
    const useFetchCurrentAgent = createQueryHook<
      'currentAgent',
      Case,
      Case,
      Record<string, never>
    >('currentAgent', [])

    await useFetchCurrentAgent({
      headers: {
        'x-division': 'fringe',
      },
    })

    const call = mockedFetch.mock.calls.at(-1)![0]
    expect(call.headers).toEqual({
      'x-division': 'fringe',
      Authorization: 'Bearer amber',
    })
  })

  it('forwards keySalt straight through to useFetchGraphQL', async () => {
    mockedFetch.mockResolvedValue({
      data: undefined,
      error: undefined,
      loading: false,
      refetch: vi.fn(),
      dehydrateJsx: null,
    })
    const createQueryHook = createQueryHookFactory({
      url: 'x',
    })
    const useFetchCurrentAgent = createQueryHook<
      'currentAgent',
      Case,
      Case,
      Record<string, never>
    >('currentAgent', [])

    await useFetchCurrentAgent({
      keySalt: 'client',
    })

    const call = mockedFetch.mock.calls.at(-1)![0]
    expect(call.keySalt).toBe('client')
  })

  it('converts the fetch-level error to ErrorLike and passes the errors array through', async () => {
    mockedFetch.mockResolvedValue({
      data: {
        data: {
          currentAgent: {
            id: '1',
          },
        },
        errors: [
          {
            message: 'anomaly',
          },
        ],
      },
      error: 'signal lost',
      loading: false,
      refetch: vi.fn(),
      dehydrateJsx: null,
    })
    const createQueryHook = createQueryHookFactory({
      url: 'x',
    })
    const useFetchCurrentAgent = createQueryHook<
      'currentAgent',
      Case,
      Case,
      Record<string, never>
    >('currentAgent', [])

    const r = await useFetchCurrentAgent()

    expect(r.error?.message).toBe('signal lost')
    expect(r.errors).toEqual([
      {
        message: 'anomaly',
      },
    ])
  })
})

// Type-only checks - the real assertion is whether the file typechecks, via
// `@ts-expect-error` on the lines that must fail to compile (see
// selector.test.ts's SelectedShape block for the same pattern).
describe('createQueryHookFactory typing', () => {
  it('narrows the result to only the selected fields', async () => {
    mockedFetch.mockResolvedValue({
      data: {
        data: {
          caseSearch: {
            id: '1',
            tag: 'Pattern',
          },
        },
      },
      error: undefined,
      loading: false,
      refetch: vi.fn(),
      dehydrateJsx: null,
    })
    const createQueryHook = createQueryHookFactory({
      url: 'x',
    })
    const useFetchCaseSearch = createQueryHook<
      'caseSearch',
      Case,
      Case,
      Record<string, never>
    >('caseSearch', [])

    const r = await useFetchCaseSearch({
      select: p => p.tag,
    })
    void r.data?.tag
    // @ts-expect-error - `severity` was not selected
    void r.data?.severity
    expect(true).toBe(true)
  })

  it('falls back to the full shape when select is omitted', async () => {
    mockedFetch.mockResolvedValue({
      data: {
        data: {
          caseSearch: {
            id: '1',
            tag: 'Pattern',
            severity: 9,
          },
        },
      },
      error: undefined,
      loading: false,
      refetch: vi.fn(),
      dehydrateJsx: null,
    })
    const createQueryHook = createQueryHookFactory({
      url: 'x',
    })
    const useFetchCaseSearch = createQueryHook<
      'caseSearch',
      Case,
      Case,
      Record<string, never>
    >('caseSearch', [])

    const r = await useFetchCaseSearch()
    void r.data?.tag
    void r.data?.severity
    expect(true).toBe(true)
  })
})
