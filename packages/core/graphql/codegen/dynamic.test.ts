import type { DocumentNode } from 'graphql'
import { print } from 'graphql'
import { describe, expect, it } from 'vitest'

import { buildOperationDocument } from '#/core/graphql/codegen/dynamic'

describe('buildOperationDocument', () => {
  it('renders a query with variables and a nested selection set', () => {
    const doc = buildOperationDocument(
      'query',
      'caseSearch',
      [
        {
          name: 'universe',
          graphqlType: 'Universe',
        },
      ],
      {
        id: true,
        tag: true,
        agents: {
          id: true,
          code: true,
        },
      },
    )
    const r = /* graphql */ `
    query CaseSearch($universe: Universe) {
      caseSearch(universe: $universe) {
        id
        tag
        agents {
          id
          code
        }
      }
    }
    `
    e(doc, r)
  })

  it('renders an operation with no variables and no parentheses', () => {
    const doc = buildOperationDocument('query', 'activePattern', [], {
      id: true,
    })
    const r = /* graphql */ `
    query ActivePattern {
      activePattern {
        id
      }
    }
    `
    e(doc, r)
  })

  it('supports mutations', () => {
    const doc = buildOperationDocument(
      'mutation',
      'agentRecruit',
      [
        {
          name: 'data',
          graphqlType: 'AgentRecruit!',
        },
      ],
      {
        id: true,
      },
    )
    const r = /* graphql */ `
    mutation AgentRecruit($data: AgentRecruit!) {
      agentRecruit(data: $data) {
        id
      }
    }
    `
    e(doc, r)
  })

  it('renders an operation with scalar result', () => {
    const doc = buildOperationDocument('query', 'caseCount', [], null)
    const r = /* graphql */ `
    query CaseCount {
      caseCount
    }
    `
    e(doc, r)
  })

  it('throws when the selection is empty (e.g. fully filtered away)', () => {
    thr(() => buildOperationDocument('query', 'caseSearch', [], {}))
  })
})

// Strips the common leading indentation off a template literal, so the
// expected GraphQL string can stay indented in line with the surrounding
// test code while still matching print()'s un-indented output.
const dedent = (s: string): string => {
  const lines = s.replace(/^\n/, '').trimEnd().split('\n')
  const indent = Math.min(
    ...lines.filter(l => l.trim()).map(l => l.length - l.trimStart().length),
  )
  return lines.map(l => l.slice(indent)).join('\n')
}

const e = (doc: DocumentNode, r: string) => {
  expect(print(doc)).toBe(dedent(r))
}
const thr = (fn: () => DocumentNode) => {
  expect(fn).toThrow()
}
