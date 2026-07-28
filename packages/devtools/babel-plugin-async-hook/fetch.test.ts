import { transformSync, types as t } from '@babel/core'
import { format } from 'prettier'
import { describe, expect, it } from 'vitest'

import type { CreateUniqIdent } from '#/devtools/babel-plugin-async-hook'
import { asyncHookPlugin } from '#/devtools/babel-plugin-async-hook'
import { config as prettierConfig } from '#/devtools/prettier/config'

// see index.test.ts for the general async-hook transform - this file only
// covers the `useFetch...()` -> `.dehydrateJsx` injection on top of it
const createUniqIdent: CreateUniqIdent = (_scope, name) =>
  t.identifier(`_${name}`)

const transform = (code: string, isServer: boolean) => {
  const result = transformSync(code, {
    filename: 'component.tsx',
    babelrc: false,
    configFile: false,
    parserOpts: {
      plugins: ['jsx', 'typescript'],
    },
    plugins: [
      [
        asyncHookPlugin,
        {
          isServer,
          createUniqIdent,
        },
      ],
    ],
  })
  return result?.code ?? ''
}

const fmt = (code: string) =>
  format(code, {
    ...prettierConfig,
    plugins: [],
    filepath: 'component.tsx',
  })

const makeExpectFmtMatch =
  (isServer: boolean) => async (input: string, output: string) => {
    const [actual, expected] = await Promise.all([
      fmt(transform(input, isServer)),
      fmt(output),
    ])
    expect(actual).toBe(expected)
  }

describe('browser/rn isServer=false', () => {
  const expectFmtMatch = makeExpectFmtMatch(false)

  it('appends .dehydrateJsx after the original return for a plain identifier result', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const r = await useFetchCard()
        return <View>{r.data}</View>
      }
      `,
      /* tsx */ `
      const Card = () => {
        const r = useFetchCard()
        return (
          <>
            <View>{r.data}</View>
            {r.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('introduces a temp var to destructure through for a destructured result', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const { data } = await useFetchCard()
        return <View>{data}</View>
      }
      `,
      /* tsx */ `
      const Card = () => {
        const _fetchCard = useFetchCard()
        const { data } = _fetchCard
        return (
          <>
            <View>{data}</View>
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))
})

describe('rsc/ssr isServer=true', () => {
  const expectFmtMatch = makeExpectFmtMatch(true)

  it('appends .dehydrateJsx after the original return for a plain identifier result', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const r = await useFetchCard()
        return <View>{r.data}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const r = await useFetchCard()
        return (
          <>
            <View>{r.data}</View>
            {r.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('introduces a temp var to destructure through for a destructured result', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const { data } = await useFetchCard()
        return <View>{data}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const _fetchCard = await useFetchCard()
        const { data } = _fetchCard
        return (
          <>
            <View>{data}</View>
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('injects into every return branch, not just the last one', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const { data } = await useFetchCard()
        if (!data) {
          return null
        }
        return <View>{data}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const _fetchCard = await useFetchCard()
        const { data } = _fetchCard
        if (!data) {
          return (
            <>
              {null}
              {_fetchCard.dehydrateJsx}
            </>
          )
        }
        return (
          <>
            <View>{data}</View>
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('injects a marker-only fragment for a bare return with no value', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const { data } = await useFetchCard()
        if (!data) {
          return
        }
        return <View>{data}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const _fetchCard = await useFetchCard()
        const { data } = _fetchCard
        if (!data) {
          return <>{_fetchCard.dehydrateJsx}</>
        }
        return (
          <>
            <View>{data}</View>
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('matches any useFetch... prefix, injects one marker per call, and auto-combines the independent awaits', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const meta = await useFetchMeta()
        const { data } = await useFetchCard()
        return <View>{data}{meta}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const [meta, _fetchCard] = await Promise.all([useFetchMeta(), useFetchCard()])
        const { data } = _fetchCard
        return (
          <>
            <View>{data}{meta}</View>
            {meta.dehydrateJsx}
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('does not merge a decl that genuinely depends on the destructured result into Promise.all', () =>
    // `related` reads `data`, which the injected temp var/destructure pair
    // resolves - this must still be recognized as a real dependency, not
    // silently parallelized
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const { data } = await useFetchCard()
        const related = await useRelated(data)
        return <View>{data}{related}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const _fetchCard = await useFetchCard()
        const { data } = _fetchCard
        const related = await useRelated(data)
        return (
          <>
            <View>{data}{related}</View>
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('still forwards the temp var correctly when a real hook forces a wrapper/inner split', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async props => {
        const { data } = await useFetchCard()
        const [open, setOpen] = useState(false)
        return <View onPress={() => setOpen(!open)}>{data}{open}</View>
      }
      `,
      /* tsx */ `
      const Card = async props => {
        const _fetchCard = await useFetchCard()
        return <_Card __fetchCard={_fetchCard} {...props} />
      }
      const _Card = ({ __fetchCard: _fetchCard, ...props }) => {
        const { data } = _fetchCard
        const [open, setOpen] = useState(false)
        return (
          <>
            <View onPress={() => setOpen(!open)}>{data}{open}</View>
            {_fetchCard.dehydrateJsx}
          </>
        )
      }
      `,
    ))

  it('does not touch a hook host - TODO, deferred until hook support is designed', () =>
    expectFmtMatch(
      /* tsx */ `
      const useFetchWrapper = async () => {
        const { data } = await useFetchCard()
        return data
      }
      `,
      /* tsx */ `
      const useFetchWrapper = async () => {
        const { data } = await useFetchCard()
        return data
      }
      `,
    ))

  it('does not touch a non-useFetch hook call', () =>
    expectFmtMatch(
      /* tsx */ `
      const Hello = async () => {
        const t = await useTranslation('common')
        return <Text>{t('hello')}</Text>
      }
      `,
      /* tsx */ `
      const Hello = async () => {
        const t = await useTranslation('common')
        return <Text>{t('hello')}</Text>
      }
      `,
    ))
})
