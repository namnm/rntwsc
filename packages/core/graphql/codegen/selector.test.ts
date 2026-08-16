import { describe, expect, it } from 'vitest'

import type { SelectedShape, Selector } from '#/core/graphql/codegen/selector'
import { selectFields } from '#/core/graphql/codegen/selector'

type Agent = {
  id: string
  code: string
  rank?: number | null
}
type Case = {
  id: string
  tag: string
  severity: number
  agents: Agent[]
}

describe('selectFields', () => {
  it('always includes __typename and id, even with no explicit selection', () => {
    const selection = selectFields<Case>(p => p.tag)
    expect(selection).toEqual({
      __typename: true,
      id: true,
      tag: true,
    })
  })

  it('records plain scalar property chains', () => {
    const selection = selectFields<Case>(p => p.tag.severity)
    expect(selection).toEqual({
      __typename: true,
      id: true,
      tag: true,
      severity: true,
    })
  })

  it('records a nested selection when an object field is called with a sub-selector', () => {
    const selection = selectFields<Case>(p => p.tag.agents(a => a.code))
    expect(selection).toEqual({
      __typename: true,
      id: true,
      tag: true,
      agents: {
        __typename: true,
        id: true,
        code: true,
      },
    })
  })

  it('keeps chaining sibling fields after a nested call', () => {
    const selection = selectFields<Case>(
      p => p.agents(a => a.code).tag.severity,
    )
    expect(selection).toEqual({
      __typename: true,
      id: true,
      agents: {
        __typename: true,
        id: true,
        code: true,
      },
      tag: true,
      severity: true,
    })
  })

  it('excludes `id` from the selector type since it is always included', () => {
    const selection = selectFields<Case>(
      p =>
        // @ts-expect-error - `id` is auto-selected and not part of the
        // selector type, so there is nothing to chain off of `p.id`.
        p.id,
    )
    expect(selection).toEqual({
      __typename: true,
      id: true,
    })
  })

  it('rejects re-selecting an already-selected scalar field at compile time', () => {
    const selection = selectFields<Case>(
      p =>
        // @ts-expect-error - `tag` was already selected, so it is excluded
        // from the selector returned by the first `.tag` and re-accessing it
        // here must fail to typecheck.
        p.tag.tag,
    )
    expect(selection).toEqual({
      __typename: true,
      id: true,
      tag: true,
    })
  })

  it('rejects re-selecting an already-selected object field at compile time', () => {
    const selection = selectFields<Case>(
      p =>
        // @ts-expect-error - `agents` was already selected via the call
        // below, so it is excluded afterwards and re-accessing it must fail
        // to typecheck.
        p.agents(a => a.code).agents,
    )
    expect(selection).toEqual({
      __typename: true,
      id: true,
      agents: {
        __typename: true,
        id: true,
        code: true,
      },
    })
  })
})

// Type-only checks - there is nothing meaningful to assert at runtime, so
// each `it` just confirms it ran; the real assertion is whether the file
// typechecks, via `@ts-expect-error` on the lines that must fail to compile.
describe('SelectedShape', () => {
  it('narrows to only the selected top-level fields, plus auto keys', () => {
    const select = (p: Selector<Case>) => p.tag.severity
    void select
    type Shape = SelectedShape<Case, ReturnType<typeof select>>
    const shape: Shape = {
      id: '1',
      tag: 'Pattern',
      severity: 9,
    }
    void shape.tag
    void shape.severity
    // @ts-expect-error - `agents` was not selected
    void shape.agents
    expect(true).toBe(true)
  })

  it('narrows a nested relation to its own sub-selection', () => {
    const select = (p: Selector<Case>) => p.tag.agents(a => a.code)
    void select
    type Shape = SelectedShape<Case, ReturnType<typeof select>>
    const shape: Shape = {
      id: '1',
      tag: 'Pattern',
      agents: [
        {
          id: 'a1',
          code: 'Dunham',
        },
      ],
    }
    void shape.agents[0].code
    // @ts-expect-error - `rank` was not selected on the nested Agent
    void shape.agents[0].rank
    expect(true).toBe(true)
  })

  it('keeps narrowing correct after chaining sibling fields past a nested call', () => {
    const select = (p: Selector<Case>) => p.agents(a => a.code).severity
    void select
    type Shape = SelectedShape<Case, ReturnType<typeof select>>
    const shape: Shape = {
      id: '1',
      severity: 9,
      agents: [
        {
          id: 'a1',
          code: 'Dunham',
        },
      ],
    }
    void shape.severity
    void shape.agents[0].code
    // @ts-expect-error - `tag` was not selected
    void shape.tag
    expect(true).toBe(true)
  })

  it('falls back to the full type when select is not used at all', () => {
    type Shape = SelectedShape<Case, never>
    const shape: Shape = {
      id: '1',
      tag: 'Pattern',
      severity: 9,
      agents: [],
    }
    void shape.tag
    void shape.severity
    void shape.agents
    expect(true).toBe(true)
  })
})
