import { CombinedGraphQLErrors } from '@apollo/client/errors'
import { describe, expect, it, vi } from 'vitest'

import type { Selector } from '#/core/graphql/codegen/selector'
import {
  graphQLErrArr,
  resolveHeaders,
  selectionOf,
  toOperationResult,
  tryBuildDocument,
} from '#/core/graphql/codegen/utils'

type Case = { id: string; tag: string; severity: number }

describe('selectionOf', () => {
  it('builds a Selection tree from a select callback', () => {
    const select = (p: Selector<Case>) => p.tag
    expect(selectionOf<Case, ReturnType<typeof select>>(select)).toEqual({
      __typename: true,
      id: true,
      tag: true,
    })
  })

  it('returns null when no select callback is given', () => {
    expect(selectionOf<Case, never>(undefined)).toBeNull()
  })
})

describe('tryBuildDocument', () => {
  it('returns the built document on success', () => {
    const built = tryBuildDocument('query', 'caseSearch', [], {
      id: true,
    })
    expect(built.error).toBeUndefined()
    expect(built.document).toBeDefined()
  })

  it('returns an ErrorLike instead of throwing when the selection is empty', () => {
    const built = tryBuildDocument('query', 'caseSearch', [], {})
    expect(built.document).toBeUndefined()
    expect(built.error).toBeInstanceOf(Error)
  })
})

describe('graphQLErrArr', () => {
  it('unwraps the errors array out of a CombinedGraphQLErrors', () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [
        {
          message: 'anomaly',
        },
      ],
    })
    expect(graphQLErrArr(error)).toEqual([
      {
        message: 'anomaly',
      },
    ])
  })

  it('returns undefined for a plain (non-GraphQL) error', () => {
    expect(graphQLErrArr(new Error('signal lost'))).toBeUndefined()
  })

  it('returns undefined when there is no error', () => {
    expect(graphQLErrArr(undefined)).toBeUndefined()
  })
})

describe('toOperationResult', () => {
  it('unwraps the operation-name key out of data', () => {
    const result = toOperationResult('caseSearch', {
      data: {
        caseSearch: [
          {
            id: '1',
          },
        ],
      },
    })
    expect(result.data).toEqual([
      {
        id: '1',
      },
    ])
  })

  it('carries the errors array through from a CombinedGraphQLErrors error', () => {
    const error = new CombinedGraphQLErrors({
      data: null,
      errors: [
        {
          message: 'anomaly',
        },
      ],
    })
    const result = toOperationResult('caseSearch', {
      error,
    })
    expect(result.error).toBe(error)
    expect(result.errors).toEqual([
      {
        message: 'anomaly',
      },
    ])
  })

  it('only sets extensions when explicitly passed', () => {
    const withExt = toOperationResult(
      'x',
      {},
      {
        case: 'amber',
      },
    )
    expect(withExt.extensions).toEqual({
      case: 'amber',
    })

    const withoutExt = toOperationResult('x', {})
    expect(withoutExt.extensions).toBeUndefined()
  })
})

describe('resolveHeaders', () => {
  it('passes headers through unchanged when no resolver is given', async () => {
    const headers = {
      'x-division': 'fringe',
    }
    await expect(resolveHeaders(undefined, headers)).resolves.toBe(headers)
  })

  it('awaits and returns the resolver result when given', async () => {
    const resolver = vi.fn().mockResolvedValue({
      Authorization: 'Bearer amber',
    })
    await expect(
      resolveHeaders(resolver, {
        'x-division': 'fringe',
      }),
    ).resolves.toEqual({
      Authorization: 'Bearer amber',
    })
    expect(resolver).toHaveBeenCalledWith({
      'x-division': 'fringe',
    })
  })
})
