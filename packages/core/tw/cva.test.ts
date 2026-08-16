import { describe, expect, it } from 'vitest'

import { cva as cvaTyped } from '#/core/tw/cva'

// cva's own generic constraint (`Map extends StrMap<string>`) never lets TS
// infer the "single className string" mode's Map as `undefined`, even
// though that mode's runtime branch (`if (className) { ... }` in cva.ts)
// works fine - no component in this codebase actually uses that mode (every
// real cva() call passes `classNames`, the map form), so this is an
// existing gap in cva's own types for an otherwise-untested code path, not
// something introduced here. Cast through `any` for this describe block
// only, since what's under test is the runtime behavior, already verified
// correct by these very assertions - "classNames map mode" below uses the
// real typed import.
const cva = cvaTyped as any

describe('cva - single className mode', () => {
  it('returns the base className with no variant', () => {
    const button = cva({
      className: 'base',
    })
    expect(button({})).toBe('base')
  })

  it('appends the matching attribute className', () => {
    const button = cva({
      className: 'base',
      attributes: {
        size: {
          sm: 'text-sm',
          lg: 'text-lg',
        },
      },
    })
    expect(
      button({
        size: 'sm',
      }),
    ).toBe('base text-sm')
    expect(
      button({
        size: 'lg',
      }),
    ).toBe('base text-lg')
  })

  it('ignores an attribute value with no matching entry', () => {
    const button = cva({
      className: 'base',
      attributes: {
        size: {
          sm: 'text-sm',
        },
      },
    })
    expect(
      button({
        size: 'md' as any,
      }),
    ).toBe('base')
  })

  it('skips undefined/null variant values', () => {
    const button = cva({
      className: 'base',
      attributes: {
        size: {
          sm: 'text-sm',
        },
      },
    })
    expect(
      button({
        size: undefined,
      }),
    ).toBe('base')
  })

  it('converts boolean-keyed attributes (true/false variant keys)', () => {
    const button = cva({
      className: 'base',
      attributes: {
        disabled: {
          true: 'opacity-50',
        },
      },
    })
    expect(
      button({
        disabled: true,
      }),
    ).toBe('base opacity-50')
    expect(
      button({
        disabled: false,
      }),
    ).toBe('base')
  })

  it('applies a compound variant only when every condition matches', () => {
    const button = cva({
      className: 'base',
      attributes: {
        size: {
          sm: 'text-sm',
          lg: 'text-lg',
        },
        shape: {
          rounded: 'rounded',
          pill: 'rounded-full',
        },
      },
      compoundVariants: [
        {
          size: 'sm',
          shape: 'rounded',
          className: 'compound-sm-rounded',
        },
      ],
    })
    expect(
      button({
        size: 'sm',
        shape: 'rounded',
      }),
    ).toBe('base text-sm rounded compound-sm-rounded')
    expect(
      button({
        size: 'sm',
        shape: 'pill',
      }),
    ).toBe('base text-sm rounded-full')
    expect(
      button({
        size: 'lg',
        shape: 'rounded',
      }),
    ).toBe('base text-lg rounded')
  })

  it('merges conflicting tailwind classes across base + attribute + compound', () => {
    const button = cva({
      className: 'p-2',
      attributes: {
        size: {
          lg: 'p-4',
        },
      },
    })
    expect(
      button({
        size: 'lg',
      }),
    ).toBe('p-4')
  })
})

describe('cva - classNames map mode', () => {
  it('resolves each key independently', () => {
    const badge = cvaTyped({
      classNames: {
        container: 'flex',
        text: 'font-medium',
      },
      attributes: {
        size: {
          sm: {
            container: 'px-1',
            text: 'text-xs',
          },
        },
      },
    })
    expect(
      badge({
        size: 'sm',
      }),
    ).toEqual({
      container: 'flex px-1',
      text: 'font-medium text-xs',
    })
  })

  it('omits keys entirely untouched by base/attributes (no empty string key)', () => {
    const badge = cvaTyped({
      classNames: {
        container: 'flex',
      },
    })
    const result = badge({})
    expect(result).toEqual({
      container: 'flex',
    })
    expect(Object.keys(result as object)).toEqual(['container'])
  })

  it('applies a compound variant to specific map keys only', () => {
    const badge = cvaTyped({
      classNames: {
        container: 'flex',
        text: 'font-medium',
      },
      attributes: {
        type: {
          primary: {},
        },
        appearance: {
          solid: {},
        },
      },
      compoundVariants: [
        {
          type: 'primary',
          appearance: 'solid',
          classNames: {
            container: 'bg-primary',
          },
        },
      ],
    })
    expect(
      badge({
        type: 'primary',
        appearance: 'solid',
      }),
    ).toEqual({
      container: 'flex bg-primary',
      text: 'font-medium',
    })
    expect(
      badge({
        type: 'primary',
        appearance: undefined as any,
      }),
    ).toEqual({
      container: 'flex',
      text: 'font-medium',
    })
  })
})
