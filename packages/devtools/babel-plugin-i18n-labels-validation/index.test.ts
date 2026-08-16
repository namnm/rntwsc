import { transformSync } from '@babel/core'
import { describe, expect, it } from 'vitest'

import type { Labels } from '#/devtools/babel-plugin-i18n-labels-validation'
import {
  i18nLabelsValidation,
  i18nLabelsValidationPlugin,
} from '#/devtools/babel-plugin-i18n-labels-validation'
import { fs } from '#/devtools/fs'

const labels: Labels = {
  common: {
    hello: 'Hello',
    bye: 'Bye',
  },
  home: {
    title: 'Home',
  },
}

describe('i18nLabelsValidation (standalone scan)', () => {
  it('reports no missing/unused keys when usage matches labels exactly', () => {
    const file = '/tmp/i18n-scan-a.tsx'
    fs.writeFileSync(
      file,
      `
      const Hello = async () => {
        const t = await useTranslationUntyped('common')
        return t('hello')
      }
      const Home = async () => {
        const t = await useTranslationUntyped('home')
        return t('title')
      }
      `,
    )
    try {
      const result = i18nLabelsValidation({
        files: [file],
        labels: {
          common: {
            hello: 'Hello',
          },
          home: {
            title: 'Home',
          },
        },
      })
      expect(result.missing).toEqual([])
      expect(result.unused).toEqual([])
    } finally {
      fs.rmSync(file)
    }
  })

  it('reports a key used in code but absent from labels as missing', () => {
    const file = '/tmp/i18n-scan-b.tsx'
    fs.writeFileSync(
      file,
      `
      const Hello = async () => {
        const t = await useTranslationUntyped('common')
        return t('nonexistent')
      }
      `,
    )
    try {
      const result = i18nLabelsValidation({
        files: [file],
        labels,
      })
      expect(result.missing).toEqual([
        expect.objectContaining({
          namespace: 'common',
          key: 'nonexistent',
        }),
      ])
    } finally {
      fs.rmSync(file)
    }
  })

  it('reports a label key never referenced in any scanned file as unused', () => {
    const file = '/tmp/i18n-scan-c.tsx'
    fs.writeFileSync(
      file,
      `
      const Hello = async () => {
        const t = await useTranslationUntyped('common')
        return t('hello')
      }
      `,
    )
    try {
      const result = i18nLabelsValidation({
        files: [file],
        labels,
      })
      expect(result.unused).toEqual(
        expect.arrayContaining([
          {
            namespace: 'common',
            key: 'bye',
          },
          {
            namespace: 'home',
            key: 'title',
          },
        ]),
      )
    } finally {
      fs.rmSync(file)
    }
  })

  it('resolves bindings destructured from Promise.all([useTranslationUntyped(...), ...])', () => {
    const file = '/tmp/i18n-scan-d.tsx'
    fs.writeFileSync(
      file,
      `
      const Hello = async () => {
        const [t, tHome] = await Promise.all([
          useTranslationUntyped('common'),
          useTranslationUntyped('home'),
        ])
        return t('hello') + tHome('title')
      }
      `,
    )
    try {
      const result = i18nLabelsValidation({
        files: [file],
        labels,
      })
      expect(result.missing).toEqual([])
    } finally {
      fs.rmSync(file)
    }
  })

  it('ignores a call to an identifier not bound to useTranslationUntyped', () => {
    const file = '/tmp/i18n-scan-e.tsx'
    fs.writeFileSync(
      file,
      `
      const Hello = () => {
        const fn = (key: string) => key
        return fn('not-a-translation-key')
      }
      `,
    )
    try {
      const result = i18nLabelsValidation({
        files: [file],
        labels,
      })
      expect(result.missing).toEqual([])
    } finally {
      fs.rmSync(file)
    }
  })
})

describe('i18nLabelsValidationPlugin (babel plugin)', () => {
  const transform = (code: string, opts: { labels: Labels }) =>
    transformSync(code, {
      filename: 'component.tsx',
      babelrc: false,
      configFile: false,
      parserOpts: {
        plugins: ['jsx', 'typescript'],
      },
      plugins: [[i18nLabelsValidationPlugin, opts]],
    })?.code

  it('does not throw when every used key exists in labels', () => {
    expect(() =>
      transform(
        `
        const Hello = async () => {
          const t = await useTranslationUntyped('common')
          return t('hello')
        }
        `,
        {
          labels,
        },
      ),
    ).not.toThrow()
  })

  it('throws a code-frame error for a missing translation key', () => {
    expect(() =>
      transform(
        `
        const Hello = async () => {
          const t = await useTranslationUntyped('common')
          return t('does-not-exist')
        }
        `,
        {
          labels,
        },
      ),
    ).toThrow(/Missing translation key "does-not-exist" in namespace "common"/)
  })
})
