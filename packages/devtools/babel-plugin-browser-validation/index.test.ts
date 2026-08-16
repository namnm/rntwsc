import { transformSync } from '@babel/core'
import { describe, expect, it } from 'vitest'

import { browserValidationPlugin } from '#/devtools/babel-plugin-browser-validation'

const transform = (
  code: string,
  {
    isServer,
    filename = 'component.tsx',
  }: { isServer: boolean; filename?: string },
) =>
  transformSync(code, {
    filename,
    babelrc: false,
    configFile: false,
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    plugins: [
      [
        browserValidationPlugin,
        {
          isServer,
        },
      ],
    ],
  })?.code

describe('browserValidationPlugin', () => {
  it('throws when a server-only module (next*/headers) is imported outside isServer', () => {
    expect(() =>
      transform("import { headers } from 'next/headers'", {
        isServer: false,
      }),
    ).toThrow(/cannot be imported in a browser bundle/)
  })

  it('throws for a wildcard match (server-*)', () => {
    expect(() =>
      transform("import { db } from 'server-only-db'", {
        isServer: false,
      }),
    ).toThrow(/cannot be imported in a browser bundle/)
  })

  it('does not throw for a server-only module when isServer is true', () => {
    expect(() =>
      transform("import { headers } from 'next/headers'", {
        isServer: true,
      }),
    ).not.toThrow()
  })

  it('does not throw for an ordinary module import', () => {
    expect(() =>
      transform("import { useState } from 'react'", {
        isServer: false,
      }),
    ).not.toThrow()
  })

  it('allows a type-only import of a server-only module even on the browser', () => {
    expect(() =>
      transform("import type { Headers } from 'next/headers'", {
        isServer: false,
      }),
    ).not.toThrow()
  })

  it('matches next*/headers for any next-family package name', () => {
    expect(() =>
      transform("import { headers } from 'next-unchecked/headers'", {
        isServer: false,
      }),
    ).toThrow(/cannot be imported in a browser bundle/)
  })

  it('does not check files outside this repo (shouldTranspile gate)', () => {
    expect(() =>
      transform("import { headers } from 'next/headers'", {
        isServer: false,
        filename: '/repo/node_modules/some-lib/index.tsx',
      }),
    ).not.toThrow()
  })
})
