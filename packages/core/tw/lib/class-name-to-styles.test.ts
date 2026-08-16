import { describe, expect, it, vi } from 'vitest'

import type {
  ClassName,
  ClassNameNative,
  ClassNameWithCalc,
  ClassNameWithSelector,
  ClassNameWithVariable,
} from '#/core/tw/class-name'
import { getTwrnc } from '#/core/tw/config'
import { classNameToStyles } from '#/core/tw/lib/class-name-to-styles'
import { reactNativeVersion } from '#/core/tw/lib/react-native-version'
import { twrncConfig } from '#/core/tw/twrnc-config'
import { createTwrnc } from '#/devtools/babel-plugin-tw/lib/create-twrnc'

vi.mock('#/core/platform', () => ({
  platform: 'android',
}))
vi.mock('#/core/tw/config', () => ({
  getTwrnc: vi.fn(),
}))
vi.mocked(getTwrnc).mockReturnValue(
  createTwrnc(twrncConfig, 'android', reactNativeVersion),
)

const s = (
  className: ClassName,
  options: Partial<Parameters<typeof classNameToStyles>[0]> = {},
) =>
  classNameToStyles({
    className,
    onSelector: () => undefined,
    variables: undefined,
    dimensions: undefined,
    ...options,
  })

describe('classNameToStyles - falsy/empty', () => {
  it('returns an empty array for undefined/null/false/empty-string className', () => {
    expect(s(undefined)).toEqual([])
    expect(s(null)).toEqual([])
    expect(s(false)).toEqual([])
    expect(s('')).toEqual([])
  })
})

describe('classNameToStyles - plain style', () => {
  it('passes a plain style object through unchanged', () => {
    expect(
      s({
        display: 'flex',
      }),
    ).toEqual([
      {
        display: 'flex',
      },
    ])
  })
})

describe('classNameToStyles - arrays', () => {
  it('flattens a top-level array into one style per entry, in order', () => {
    expect(
      s([
        {
          display: 'flex',
        },
        {
          width: 100,
        },
      ]),
    ).toEqual([
      {
        display: 'flex',
      },
      {
        width: 100,
      },
    ])
  })

  it('flattens nested arrays too', () => {
    expect(
      s([
        {
          display: 'flex',
        },
        [
          {
            width: 100,
          },
          {
            height: 10,
          },
        ],
      ]),
    ).toEqual([
      {
        display: 'flex',
      },
      {
        width: 100,
      },
      {
        height: 10,
      },
    ])
  })

  it('drops falsy entries inside an array', () => {
    expect(
      s([
        {
          display: 'flex',
        },
        false,
        null,
        undefined,
      ]),
    ).toEqual([
      {
        display: 'flex',
      },
    ])
  })
})

describe('classNameToStyles - selector', () => {
  const className: ClassNameWithSelector = {
    selector: 'active',
    style: {
      opacity: 0.5,
    },
  }

  it('includes the sub-selection when onSelector resolves it', () => {
    expect(
      s(className, {
        onSelector: () => ({
          opacity: 0.5,
        }),
      }),
    ).toEqual([
      {
        opacity: 0.5,
      },
    ])
  })

  it('excludes the sub-selection when onSelector returns falsy', () => {
    expect(
      s(className, {
        onSelector: () => undefined,
      }),
    ).toEqual([])
  })

  it('calls onSelector with the original selector/style pair', () => {
    const onSelector = vi.fn().mockReturnValue(undefined)
    s(className, {
      onSelector,
    })
    expect(onSelector).toHaveBeenCalledWith(className)
  })

  it('recurses into whatever onSelector resolves to, including nested selectors', () => {
    const nested: ClassNameWithSelector = {
      selector: 'active',
      style: {
        selector: 'dark',
        style: {
          color: 'red',
        },
      },
    }
    expect(
      s(nested, {
        onSelector: c => c.style,
      }),
    ).toEqual([
      {
        color: 'red',
      },
    ])
  })
})

describe('classNameToStyles - variable', () => {
  const className: ClassNameWithVariable = {
    variable: '--primary-500',
    key: 'color',
  }

  it('resolves a variable from the variables map', () => {
    expect(
      s(className, {
        variables: {
          '--primary-500': '#ef4444',
        },
      }),
    ).toEqual([
      {
        color: '#ef4444',
      },
    ])
  })

  it('is dropped when the variable is missing from the map', () => {
    expect(
      s(className, {
        variables: {},
      }),
    ).toEqual([])
    expect(
      s(className, {
        variables: undefined,
      }),
    ).toEqual([])
  })

  it('applies alpha via hexToRgba when given', () => {
    const withAlpha: ClassNameWithVariable = {
      ...className,
      alpha: 0.5,
    }
    expect(
      s(withAlpha, {
        variables: {
          '--primary-500': '#ef4444',
        },
      }),
    ).toEqual([
      {
        color: 'rgba(239,68,68,0.5)',
      },
    ])
  })
})

describe('classNameToStyles - calc', () => {
  it('resolves a plain unitless value to every key in `keys`', () => {
    const className: ClassNameWithCalc = {
      calc: {
        v: 4,
      },
      keys: ['paddingLeft', 'paddingRight'],
    }
    expect(s(className)).toEqual([
      {
        paddingLeft: 4,
        paddingRight: 4,
      },
    ])
  })

  it('resolves vw/vh proportionally against dimensions', () => {
    const vw: ClassNameWithCalc = {
      calc: {
        v: 50,
        unit: 'vw',
      },
      keys: ['width'],
    }
    const vh: ClassNameWithCalc = {
      calc: {
        v: 50,
        unit: 'vh',
      },
      keys: ['height'],
    }
    const dimensions = {
      width: 400,
      height: 800,
    }
    expect(
      s(vw, {
        dimensions,
      }),
    ).toEqual([
      {
        width: 200,
      },
    ])
    expect(
      s(vh, {
        dimensions,
      }),
    ).toEqual([
      {
        height: 400,
      },
    ])
  })

  it('is dropped when vw/vh has no dimensions to resolve against', () => {
    const className: ClassNameWithCalc = {
      calc: {
        v: 50,
        unit: 'vw',
      },
      keys: ['width'],
    }
    expect(
      s(className, {
        dimensions: undefined,
      }),
    ).toEqual([])
  })

  it('supports +, -, *, / operators', () => {
    const calc = (op: '+' | '-' | '*' | '/'): ClassNameWithCalc => ({
      calc: {
        l: {
          v: 10,
        },
        r: {
          v: 4,
        },
        op,
      },
      keys: ['width'],
    })
    expect(s(calc('+'))).toEqual([
      {
        width: 14,
      },
    ])
    expect(s(calc('-'))).toEqual([
      {
        width: 6,
      },
    ])
    expect(s(calc('*'))).toEqual([
      {
        width: 40,
      },
    ])
    expect(s(calc('/'))).toEqual([
      {
        width: 2.5,
      },
    ])
  })

  it('is dropped on division by zero', () => {
    const className: ClassNameWithCalc = {
      calc: {
        l: {
          v: 10,
        },
        r: {
          v: 0,
        },
        op: '/',
      },
      keys: ['width'],
    }
    expect(s(className)).toEqual([])
  })

  it('resolves a nested operator tree, left-associatively', () => {
    // (100vw - 20) + 10, with a 400-wide viewport -> (400 - 20) + 10
    const className: ClassNameWithCalc = {
      calc: {
        l: {
          l: {
            v: 100,
            unit: 'vw',
          },
          r: {
            v: 20,
          },
          op: '-',
        },
        r: {
          v: 10,
        },
        op: '+',
      },
      keys: ['width'],
    }
    expect(
      s(className, {
        dimensions: {
          width: 400,
          height: 0,
        },
      }),
    ).toEqual([
      {
        width: 390,
      },
    ])
  })
})

describe('classNameToStyles - level ordering', () => {
  it('sorts resolved styles by nesting level, deeper (selector) entries last', () => {
    const className: ClassNameNative[] = [
      {
        width: 100,
      },
      {
        selector: 'active',
        style: {
          width: 200,
        },
      },
    ]
    // both set `width` - the array order alone would make the plain 100 win
    // on a naive Object.assign merge, but the selector-nested one is level 1
    // and must sort after it so callers merging left-to-right get 200.
    expect(
      s(className, {
        onSelector: c => c.style,
      }),
    ).toEqual([
      {
        width: 100,
      },
      {
        width: 200,
      },
    ])
  })
})

// Real classNameToNative underneath (via the real twrnc built above) - not
// mocked, so these exercise the actual string -> ClassNameNative -> resolved
// style pipeline end to end, the same way class-name-to-native.test.ts does
// for classNameToNative alone.
describe('classNameToStyles - string className (real classNameToNative)', () => {
  it('resolves a plain utility class', () => {
    expect(s('flex')).toEqual([
      {
        display: 'flex',
      },
    ])
  })

  it('resolves multiple space-separated utilities in one string as one merged style', () => {
    // twrnc's own `.style()` already merges a whole class string into one
    // object before classNameToNative sees it - classNameToStyles never gets
    // a chance to split it back apart, so this is one entry, not two.
    expect(s('flex items-center')).toEqual([
      {
        display: 'flex',
        alignItems: 'center',
      },
    ])
  })

  it('resolves a selector-prefixed utility when onSelector matches it', () => {
    expect(
      s('active:opacity-50', {
        onSelector: c => (c.selector === 'active' ? c.style : undefined),
      }),
    ).toEqual([
      {
        opacity: 0.5,
      },
    ])
  })

  it('drops a selector-prefixed utility when onSelector does not match it', () => {
    expect(
      s('active:opacity-50', {
        onSelector: () => undefined,
      }),
    ).toEqual([])
  })

  it('resolves a variable utility using the variables map', () => {
    expect(
      s('text-primary', {
        variables: {
          '--primary-500': '#ef4444',
        },
      }),
    ).toEqual([
      {
        color: '#ef4444',
      },
    ])
  })

  it('resolves a variable utility with alpha', () => {
    expect(
      s('text-primary/50', {
        variables: {
          '--primary-500': '#ef4444',
        },
      }),
    ).toEqual([
      {
        color: 'rgba(239,68,68,0.5)',
      },
    ])
  })

  it('resolves a calc utility using dimensions', () => {
    expect(
      s('w-[calc(100vw-20px)]', {
        dimensions: {
          width: 400,
          height: 0,
        },
      }),
    ).toEqual([
      {
        width: 380,
      },
    ])
  })

  it('warns in dev when warnOnString is set and className is a string', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    s('flex', {
      warnOnString: true,
    })
    expect(spy).toHaveBeenCalledOnce()
    spy.mockRestore()
  })

  it('does not warn when warnOnString is not set', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    s('flex')
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })
})
