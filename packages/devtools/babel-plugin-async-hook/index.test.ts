import { transformSync, types as t } from '@babel/core'
import { format } from 'prettier'
import { describe, expect, it } from 'vitest'

import type { CreateUniqIdent } from '#/devtools/babel-plugin-async-hook'
import { asyncHookPlugin } from '#/devtools/babel-plugin-async-hook'
import { config as prettierConfig } from '#/devtools/prettier/config'

// deterministic, human-writable uid generator for stable test expectations -
// production code uses babel's own collision-safe scope.generateUidIdentifier
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

// tailwind/xml plugins are irrelevant to these snippets - drop them so the
// test doesn't need to resolve them, keep the rest of the real project style
const fmt = (code: string) =>
  format(code, {
    ...prettierConfig,
    plugins: [],
    filepath: 'component.tsx',
  })

// bound to a fixed isServer per describe block, so call sites read exactly
// as `expectFmtMatch(input, output)` - transpile `input`, fmt both sides,
// and diff against `output` (also fmt'd, so it doesn't need to be hand-styled)
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

  it('strips a single awaited hook and drops async', () =>
    expectFmtMatch(
      /* tsx */ `
      const Hello = async () => {
        const t = await useTranslation('common')
        return <Text>{t('hello')}</Text>
      }
      `,
      /* tsx */ `
      const Hello = () => {
        const t = useTranslation('common')
        return <Text>{t('hello')}</Text>
      }
      `,
    ))

  it('leaves a component with no awaited hooks untouched', () =>
    expectFmtMatch(
      /* tsx */ `
      const Spinner = () => {
        return <ActivityIndicator />
      }
      `,
      /* tsx */ `
      const Spinner = () => {
        return <ActivityIndicator />
      }
      `,
    ))

  it('transpiles a stray `await use...()` with no variable declaration', () =>
    expectFmtMatch(
      /* tsx */ `
      const Foo = async () => {
        await useTrackView()
        return <Text>hi</Text>
      }
      `,
      /* tsx */ `
      const Foo = () => {
        useTrackView()
        return <Text>hi</Text>
      }
      `,
    ))

  it('allows a hook composing other hooks - strips it the same as a component', () =>
    expectFmtMatch(
      /* tsx */ `
      const useCombinedLabel = async () => {
        const t = await useTranslation('common')
        return t('label')
      }
      `,
      /* tsx */ `
      const useCombinedLabel = () => {
        const t = useTranslation('common')
        return t('label')
      }
      `,
    ))

  it('throws on an unsupported await shape', () => {
    // needs a hook call somewhere in the component to be picked up at all -
    // a component with no `use...` call is left untouched, awaits included
    expect(() =>
      transform(
        /* tsx */ `
        const Hello = async () => {
          const t = await useTranslation('common')
          const res = await fetch('/api/greeting')
          return <Text>{t('hello')}{res}</Text>
        }
        `,
        false,
      ),
    ).toThrow('Only support `await use...()`')
  })
})

describe('rsc/ssr isServer=true', () => {
  const expectFmtMatch = makeExpectFmtMatch(true)

  it('leaves a data-only async component fully async, unsplit', () =>
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

  it('transpiles a stray `await use...()` with no variable declaration and no real hook', () =>
    expectFmtMatch(
      /* tsx */ `
      const Foo = async () => {
        const t = await useTranslation('common')
        await useTrackView()
        return <Text>{t('hi')}</Text>
      }
      `,
      /* tsx */ `
      const Foo = async () => {
        const t = await useTranslation('common')
        await useTrackView()
        return <Text>{t('hi')}</Text>
      }
      `,
    ))

  it('splits a component that mixes an awaited hook with a real hook', () =>
    expectFmtMatch(
      /* tsx */ `
      const Button = async props => {
        const t = await useTranslation('common')
        const rtl = await useIsRtl()
        const [pressing, setPressing] = useState(false)
        return <Pressable rtl={rtl}>{t('submit')}{pressing}</Pressable>
      }
      `,
      /* tsx */ `
      const Button = async props => {
        const [t, rtl] = await Promise.all([useTranslation('common'), useIsRtl()])
        return <_Button _t={t} _rtl={rtl} {...props} />
      }
      const _Button = ({ _t: t, _rtl: rtl, ...props }) => {
        const [pressing, setPressing] = useState(false)
        return <Pressable rtl={rtl}>{t('submit')}{pressing}</Pressable>
      }
      `,
    ))

  it('keeps a component with no real hook unsplit even with multiple data hooks', () =>
    expectFmtMatch(
      /* tsx */ `
      const Hello = async () => {
        const t = await useTranslation('common')
        const dir = await useCurrentDirection()
        return <Text dir={dir}>{t('hello')}</Text>
      }
      `,
      /* tsx */ `
      const Hello = async () => {
        const [t, dir] = await Promise.all([useTranslation('common'), useCurrentDirection()])
        return <Text dir={dir}>{t('hello')}</Text>
      }
      `,
    ))

  it('supports function declarations', () =>
    expectFmtMatch(
      /* tsx */ `
      export async function ProfileCard(props) {
        const profile = await useProfile('/api/profile')
        useEffect(() => {
          trackView('profile')
        }, [])
        return <View>{profile}</View>
      }
      `,
      /* tsx */ `
      export async function ProfileCard(props) {
        const profile = await useProfile('/api/profile')
        return <_ProfileCard _profile={profile} {...props} />
      }
      function _ProfileCard({ _profile: profile, ...props }) {
        useEffect(() => {
          trackView('profile')
        }, [])
        return <View>{profile}</View>
      }
      `,
    ))

  it('does not split when the real hook is inside a nested component', () =>
    expectFmtMatch(
      /* tsx */ `
      const Card = async props => {
        const data = await useCard('/api/card')
        const Toggle = () => {
          useState(false)
          return null
        }
        return <View>{data}<Toggle /></View>
      }
      `,
      /* tsx */ `
      const Card = async props => {
        const data = await useCard('/api/card')
        const Toggle = () => {
          useState(false)
          return null
        }
        return <View>{data}<Toggle /></View>
      }
      `,
    ))

  it('allows a hook composing other hooks when no real hook follows the first await', () =>
    expectFmtMatch(
      /* tsx */ `
      const useCombinedLabel = async () => {
        const t = await useTranslation('common')
        return t('label')
      }
      `,
      /* tsx */ `
      const useCombinedLabel = async () => {
        const t = await useTranslation('common')
        return t('label')
      }
      `,
    ))

  it('allows a hook that calls a real hook before its own await - confirmed safe empirically', () =>
    // verified against the real react-dom@19 + renderToPipeableStream: a
    // real hook called before any await, even nested inside a helper hook
    // that a component then awaits, works fine - the dispatcher is still
    // valid at that point, since nothing has suspended yet
    expectFmtMatch(
      /* tsx */ `
      const useDarkModeState = async () => {
        const mounted = useIsMounted()
        const user = await useDarkModeUser()
        if (!mounted) {
          return
        }
        return user
      }
      `,
      /* tsx */ `
      const useDarkModeState = async () => {
        const mounted = useIsMounted()
        const user = await useDarkModeUser()
        if (!mounted) {
          return
        }
        return user
      }
      `,
    ))

  it('supports a destructured object pattern param', () =>
    // the wrapper trades the original pattern for a fresh plain identifier,
    // recovers the original bindings from it via an injected destructuring
    // statement (so a leading data-decl could still reference them), and
    // forwards the whole thing to the inner component with a single spread
    expectFmtMatch(
      /* tsx */ `
      const Card = async ({ title, elevated = true, ...rest }) => {
        const data = await useCard('/api/card')
        const [hovered, setHovered] = useState(false)
        return <View elevated={elevated} hovered={hovered}>{title}{data}</View>
      }
      `,
      /* tsx */ `
      const Card = async _props => {
        const { title, elevated = true, ...rest } = _props
        const data = await useCard('/api/card')
        return <_Card _data={data} {..._props} />
      }
      const _Card = ({ title, elevated = true, _data: data, ...rest }) => {
        const [hovered, setHovered] = useState(false)
        return <View elevated={elevated} hovered={hovered}>{title}{data}</View>
      }
      `,
    ))

  it('supports a destructured param with a nested pattern', () =>
    // the "spread the whole object through, recover bindings on both sides"
    // approach means a nested pattern needs no special handling at all,
    // unlike the old per-property forwarding it replaced
    expectFmtMatch(
      /* tsx */ `
      const Card = async ({ meta: { title }, ...rest }) => {
        const data = await useCard('/api/card')
        useState(false)
        return <View>{title}{data}</View>
      }
      `,
      /* tsx */ `
      const Card = async _props => {
        const { meta: { title }, ...rest } = _props
        const data = await useCard('/api/card')
        return <_Card _data={data} {..._props} />
      }
      const _Card = ({ meta: { title }, _data: data, ...rest }) => {
        useState(false)
        return <View>{title}{data}</View>
      }
      `,
    ))

  it('supports a leading decl whose LHS destructures the awaited hook result', () =>
    expectFmtMatch(
      /* tsx */ `
      const LangSwitcher = async () => {
        const { currentLang, onSwitch } = await useLangSwitcherProps()
        const [open, setOpen] = useState(false)
        return <View onPress={() => setOpen(!open)}>{currentLang}{open}</View>
      }
      `,
      /* tsx */ `
      const LangSwitcher = async () => {
        const { currentLang, onSwitch } = await useLangSwitcherProps()
        return <_LangSwitcher _currentLang={currentLang} _onSwitch={onSwitch} />
      }
      const _LangSwitcher = ({ _currentLang: currentLang, _onSwitch: onSwitch }) => {
        const [open, setOpen] = useState(false)
        return <View onPress={() => setOpen(!open)}>{currentLang}{open}</View>
      }
      `,
    ))

  it('leaves no real hook untouched when a destructured leading decl has none', () =>
    // regression: hasOwnHookCall used to count the *awaited* useLangSwitcherProps
    // call below as a real hook (since the destructured LHS above stopped the
    // leading run), triggering a bogus split with a stray await left behind
    // in the non-async inner component
    expectFmtMatch(
      /* tsx */ `
      const LangSwitcher = async () => {
        const { currentLang, onSwitch } = await useLangSwitcherProps()
        return <View onPress={onSwitch}>{currentLang}</View>
      }
      `,
      /* tsx */ `
      const LangSwitcher = async () => {
        const { currentLang, onSwitch } = await useLangSwitcherProps()
        return <View onPress={onSwitch}>{currentLang}</View>
      }
      `,
    ))

  it('does not throw when a real hook comes before the await it produced a value for', () =>
    // confirmed empirically: `id` (useState) is read *before* any await, so
    // the dispatcher is still valid - a data dependency on it is irrelevant
    // to hook safety, only the ordering of real-hook-vs-first-await matters
    expectFmtMatch(
      /* tsx */ `
      const ProductCard = async props => {
        const [id] = useState(props.initialId)
        const data = await useProduct(id)
        return <View>{data}</View>
      }
      `,
      /* tsx */ `
      const ProductCard = async props => {
        const [id] = useState(props.initialId)
        const data = await useProduct(id)
        return <View>{data}</View>
      }
      `,
    ))

  it('auto-combines two or more adjacent independent leading awaits into Promise.all', () =>
    // safe to do automatically - nothing sits between them, so nothing
    // about ordering/positioning changes, only how they resolve (parallel
    // instead of sequential)
    expectFmtMatch(
      /* tsx */ `
      const Header = async () => {
        const t = await useTranslation('common')
        const rtl = await useIsRtl()
        return <Text dir={rtl ? 'rtl' : 'ltr'}>{t('title')}</Text>
      }
      `,
      /* tsx */ `
      const Header = async () => {
        const [t, rtl] = await Promise.all([useTranslation('common'), useIsRtl()])
        return <Text dir={rtl ? 'rtl' : 'ltr'}>{t('title')}</Text>
      }
      `,
    ))

  it('auto-combines 3+ adjacent independent leading awaits', () =>
    expectFmtMatch(
      /* tsx */ `
      const Header = async () => {
        const t = await useTranslation('common')
        const user = await useCurrentUser()
        const flags = await useFeatureFlags()
        return <View>{t('title')}{user.name}{flags.betaEnabled}</View>
      }
      `,
      /* tsx */ `
      const Header = async () => {
        const [t, user, flags] = await Promise.all([useTranslation('common'), useCurrentUser(), useFeatureFlags()])
        return <View>{t('title')}{user.name}{flags.betaEnabled}</View>
      }
      `,
    ))

  it('merges adjacent independent awaits and still splits when a real hook follows', () =>
    // the merge runs first, so the leading-run scan below sees one combined
    // decl (not two) - the split then proceeds exactly as if it had been
    // written as Promise.all by hand
    expectFmtMatch(
      /* tsx */ `
      const Button = async props => {
        const t = await useTranslation('common')
        const rtl = await useIsRtl()
        const [pressing, setPressing] = useState(false)
        return <Pressable rtl={rtl}>{t('submit')}{pressing}</Pressable>
      }
      `,
      /* tsx */ `
      const Button = async props => {
        const [t, rtl] = await Promise.all([useTranslation('common'), useIsRtl()])
        return <_Button _t={t} _rtl={rtl} {...props} />
      }
      const _Button = ({ _t: t, _rtl: rtl, ...props }) => {
        const [pressing, setPressing] = useState(false)
        return <Pressable rtl={rtl}>{t('submit')}{pressing}</Pressable>
      }
      `,
    ))

  it('does not throw when a later leading await genuinely depends on an earlier one', () =>
    // useProducts(category) can only run after category resolves - this is
    // not something Promise.all could parallelize, so it is left as-is
    expectFmtMatch(
      /* tsx */ `
      const ProductList = async () => {
        const category = await useCategory()
        const products = await useProducts(category)
        return <View>{products.length}</View>
      }
      `,
      /* tsx */ `
      const ProductList = async () => {
        const category = await useCategory()
        const products = await useProducts(category)
        return <View>{products.length}</View>
      }
      `,
    ))

  it('auto-combines a leading independent pair before a dependent decl', () =>
    // [category, filters] get merged into one Promise.all first (adjacent,
    // independent); products depending on category afterward is a genuine
    // sequential dependency, not something to parallelize
    expectFmtMatch(
      /* tsx */ `
      const ProductPage = async () => {
        const category = await useCategory()
        const filters = await useFilters()
        const products = await useProducts(category)
        return <View>{filters.length}{products.length}</View>
      }
      `,
      /* tsx */ `
      const ProductPage = async () => {
        const [category, filters] = await Promise.all([useCategory(), useFilters()])
        const products = await useProducts(category)
        return <View>{filters.length}{products.length}</View>
      }
      `,
    ))

  it('sees through a plain destructuring alias of an earlier decl when checking adjacency', () =>
    // `const { data } = cardResult` re-destructures an already-resolved
    // decl, not a new async dependency - it must not block `other` (which
    // reads neither `cardResult` nor `data`) from merging with `cardResult`
    expectFmtMatch(
      /* tsx */ `
      const Card = async () => {
        const cardResult = await useCard()
        const { data } = cardResult
        const other = await useOtherThing()
        return <View>{data}{other}</View>
      }
      `,
      /* tsx */ `
      const Card = async () => {
        const [cardResult, other] = await Promise.all([useCard(), useOtherThing()])
        const { data } = cardResult
        return <View>{data}{other}</View>
      }
      `,
    ))

  it('still detects a dependency that flows through a plain destructuring alias', () =>
    // `related` reads `data`, which is only bound by the alias statement
    // (not the await decl itself) - independence must be judged against
    // names the alias introduces too, not just the original decl's own LHS
    expect(() =>
      transform(
        /* tsx */ `
        const Card = async () => {
          const cardResult = await useCard()
          const { data } = cardResult
          const related = await useRelated(data)
          const other = await useOtherThing()
          return <View>{data}{related}{other}</View>
        }
        `,
        true,
      ),
    ).toThrow('move it up so it is adjacent'))

  it('auto-combines all three when the middle decl is also independent with each other', () =>
    // unlike the test above, `product` does not read `category` either - all
    // three are independent and still adjacent, so nothing blocks `banner`
    // from joining the same group, regardless of it reading `props`
    expectFmtMatch(
      /* tsx */ `
      const ProductPage = async props => {
        const category = await useCategory()
        const banner = await useBanner(props.bannerId)
        const product = await useProduct()
        return <View>{category}{product}{banner}</View>
      }
      `,
      /* tsx */ `
      const ProductPage = async props => {
        const [category, banner, product] = await Promise.all([useCategory(), useBanner(props.bannerId), useProduct()])
        return <View>{category}{product}{banner}</View>
      }
      `,
    ))

  it('throws for a plain statement interrupting the leading run before a further await-hook call', () =>
    // `theme` depends on `lang` (not independent), so this is specifically
    // exercising the "separated from the leading run" throw, not the
    // waterfall one below - a plain statement between two await-hook decls
    // pushes the second await into the inner component, which stays
    // non-async - since a real hook (useSetTheme) still forces a split, this
    // can only ever produce a stray await in non-async code, so it fails
    expect(() =>
      transform(
        /* tsx */ `
        const ThemeSwitcher = async () => {
          const lang = await useCurrentLang()
          const themes = getAvailableThemes()
          const theme = await useTheme(lang)
          const setTheme = useSetTheme()
          return <View onPress={() => setTheme(theme)}>{lang}{themes.length}</View>
        }
        `,
        true,
      ),
    ).toThrow('separated from the leading run'))

  it('throws when a real hook comes both before and after the first await', () =>
    // the *second* useState (after the await) is the actually broken one -
    // the first one, before it, is fine on its own (see the test above)
    expect(() =>
      transform(
        /* tsx */ `
        const ProductCard = async props => {
          const [id] = useState(props.initialId)
          const data = await useProduct(id)
          const [label] = useState(data)
          return <View>{label}</View>
        }
        `,
        true,
      ),
    ).toThrow())

  it('throws for independent awaits even with a statement between them and no real hook at all', () =>
    // position and real-hook presence are irrelevant to the waterfall check -
    // any two independent `await use...()` calls anywhere in the function
    // should always be resolved together via Promise.all
    expect(() =>
      transform(
        /* tsx */ `
        const ThemeLabel = async () => {
          const t = await useTranslation('common')
          const prefix = getPrefix()
          const theme = await useTheme()
          return <Text>{prefix}{t('theme')}{theme}</Text>
        }
        `,
        true,
      ),
    ).toThrow('move it up so it is adjacent'))

  it('throws when a decl after a merged group is independent of it - should join the group', () =>
    // `banner` doesn't depend on category, filters, or products - it should
    // have been adjacent to (and merged with) category/filters above,
    // instead of running after the dependent `products` decl
    expect(() =>
      transform(
        /* tsx */ `
        const ProductPage = async () => {
          const category = await useCategory()
          const filters = await useFilters()
          const products = await useProducts(category)
          const banner = await useBanner()
          return <View>{filters.length}{products.length}{banner}</View>
        }
        `,
        true,
      ),
    ).toThrow('move it up so it is adjacent'))

  it('throws when an independent decl reads a var from outside the leading run (props, not another hook)', () =>
    // `banner` doesn't reference `category` or `products` at all - it reads
    // `props`, a name never bound by any hook decl - independence is judged
    // against names produced by earlier hook decls, not "references nothing"
    expect(() =>
      transform(
        /* tsx */ `
        const ProductPage = async props => {
          const category = await useCategory()
          const products = await useProducts(category)
          const banner = await useBanner(props.bannerId)
          return <View>{products.length}{banner}</View>
        }
        `,
        true,
      ),
    ).toThrow('move it up so it is adjacent'))

  it('throws for multiple await-hook decls with a stray plain statement between them', () =>
    // `currency`/`order` merge into one Promise.all (adjacent, independent);
    // the analytics call is an ordinary statement, not a hook - it pushes
    // `tax` (which genuinely depends on `order`) out of the leading run,
    // and the real hook (useState) after it forces a split attempt, which
    // then fails because `tax` cannot be moved into the inner component
    expect(() =>
      transform(
        /* tsx */ `
        const OrderSummary = async () => {
          const currency = await useCurrency()
          const order = await useOrder()
          logAnalyticsEvent('order_summary_viewed')
          const tax = await useTax(order)
          const [expanded, setExpanded] = useState(false)
          return <View>{currency}{order.total}{tax}{expanded}</View>
        }
        `,
        true,
      ),
    ).toThrow('separated from the leading run'))

  it('throws when a hook calls a real hook after its own await - confirmed unsafe empirically', () =>
    // verified against the real react-dom@19 + renderToPipeableStream:
    // a real hook called after an async function's own first await throws
    // "Invalid hook call" at runtime, regardless of nesting - this used to
    // be silently allowed for any hook host, which was a real bug
    expect(() =>
      transform(
        /* tsx */ `
        const useStatefulLabel = async () => {
          const t = await useTranslation('common')
          const [count, setCount] = useState(0)
          return t('label') + count
        }
        `,
        true,
      ),
    ).toThrow('after its own `await use...()`'))
})

// checked before any isServer branching (candidacy collection, or the
// Promise.all ban that runs first in both split paths) - identical either way
describe.each([false, true])('shared checks, isServer=%s', isServer => {
  it('throws when writing `await Promise.all(...)` by hand', () =>
    expect(() =>
      transform(
        /* tsx */ `
        const Header = async () => {
          const [t, rtl] = await Promise.all([useTranslation('common'), useIsRtl()])
          return <Text dir={rtl ? 'rtl' : 'ltr'}>{t('title')}</Text>
        }
        `,
        isServer,
      ),
    ).toThrow('Do not write `await Promise.all(...)` by hand'))

  it('throws for a lowercase-first name - not a component or hook by convention', () =>
    expect(() =>
      transform(
        /* tsx */ `
        const loadUserCard = async props => {
          const t = await useTranslation('common')
          return <Text>{t('hello')}</Text>
        }
        `,
        isServer,
      ),
    ).toThrow('not a validly named component'))

  it('throws when an awaited hook is inside an object method', () =>
    expect(() =>
      transform(
        /* tsx */ `
        const obj = {
          async Render() {
            const t = await useTranslation('common')
            return <Text>{t('hello')}</Text>
          }
        }
        `,
        isServer,
      ),
    ).toThrow('inside an object/class method'))

  it('throws when an awaited hook is inside a class method', () =>
    expect(() =>
      transform(
        /* tsx */ `
        class Foo {
          async Render() {
            const t = await useTranslation('common')
            return <Text>{t('hello')}</Text>
          }
        }
        `,
        isServer,
      ),
    ).toThrow('inside an object/class method'))

  it('throws for an anonymous default-exported function', () =>
    expect(() =>
      transform(
        /* tsx */ `
        export default async function (props) {
          const t = await useTranslation('common')
          return <Text>{t('hello')}</Text>
        }
        `,
        isServer,
      ),
    ).toThrow('anonymous function'))

  it('throws for an unsupported param shape (e.g. array pattern)', () =>
    expect(() =>
      transform(
        /* tsx */ `
        const Row = async ([a, b]) => {
          const t = await useTranslation('common')
          useState(false)
          return <Text>{a}{b}{t('x')}</Text>
        }
        `,
        // TODO:
        true,
      ),
    ).toThrow('parameter must be a plain identifier or an object pattern'))

  it('throws for more than one parameter (e.g. leftover forwardRef shape)', () =>
    expect(() =>
      transform(
        /* tsx */ `
        const Row = async (props, ref) => {
          const t = await useTranslation('common')
          useState(false)
          return <Text ref={ref}>{t('x')}</Text>
        }
        `,
        // TODO:
        true,
      ),
    ).toThrow('takes more than one parameter'))
})
