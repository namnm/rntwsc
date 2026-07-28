<!-- START doctoc -->

- [Async components](#async-components)
  - [Four boundaries](#four-boundaries)
  - [What the transpile actually supports](#what-the-transpile-actually-supports)
  - [Independent awaits are combined automatically](#independent-awaits-are-combined-automatically)
  - [Async hooks vs client hooks](#async-hooks-vs-client-hooks)
  - [Splitting a component: the Button example](#splitting-a-component-the-button-example)
  - [FAQ](#faq)

<!-- END doctoc -->

# Async components

Async components are transpiled to sync for browser and native bundles. Only async components that call an await use.. hook are affected:

```tsx
// source (server)
import { useTranslation } from '#/core/i18n'
export const Hello = async () => {
  const t = await useTranslation('common')
  return <Text>{t('hello')}</Text>
}

// transpiled (browser or native) - import path rewritten to the matching variant
import { useTranslation } from '#/core/i18n/index.browser'
export const Hello = () => {
  const t = useTranslation('common')
  return <Text>{t('hello')}</Text>
}
```

This is what lets a component be written once, as an async Server Component, and still work as a plain synchronous Client Component or React Native component - the same source compiles differently per platform, following the same use.. hook it already calls (see browser-variant.md for how each hook's own browser or native file is chosen). See hydration.md for how data fetching hooks (useFetch, useFetchGraphQL) use this to fetch once on the server and pick the same data back up on the client without a second request.

## Four boundaries

It is tempting to think in terms of "server" vs "client", but there are four distinct boundaries at play, and `'use client'` does not mean "never runs on the server":

| Boundary  | Runs where                                                       | Real `async function` component?                                         |
| --------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `rsc`     | Server (Node), once per request, never re-executes anywhere else | Yes                                                                      |
| `ssr`     | Server (Node), rendering a Client Component to initial HTML      | Yes - Node can just `await` before calling React's renderer              |
| `browser` | The actual browser, after hydration                              | Possible via Suspense/`use()`, but not the shape this framework uses     |
| `rn`      | React Native, on-device                                          | No - no server, no Suspense-driven async rendering, no equivalent at all |

A file with no `'use client'` directive is `rsc: true` - it only ever executes in the `rsc` boundary; its output (already-rendered HTML/RSC payload) is what reaches everything downstream, never its own source.

A file with `'use client'` is `rsc: false`, but it still runs on the server once, during `ssr`, before it ever reaches a browser - that pass produces the initial HTML. It then runs again, later, in `browser` for hydration. Unlike `rsc` vs the rest, `ssr` and `browser` are two genuinely separate compiles of the same source (see below), not one shared bundle.

Since the framework wants one hook shape (`await useX()`) that works unmodified on `rn` too, it settles for the lowest common denominator across all four: real `await` only where a boundary is definitely running in Node (`rsc`, `ssr`); everywhere else (`browser`, `rn`) the same call is stripped to a plain synchronous one. `browser` could in principle support real async components via Suspense, the same way `ssr` does - it is grouped with `rn` here by choice, to keep exactly one code shape across `browser` and `rn`, not because of a technical limit of the browser itself.

## What the transpile actually supports

packages/devtools/babel-plugin-async-hook only recognizes one shape written by hand inside an async function - `await useSomething()`, with or without a variable declaration - and throws a build error on anything else:

```tsx
await useSomething()
const value = await useSomething()
```

Anything else awaited inside such a function - `await fetch(...)`, `await someHelper()`, `await useSomething().then(...)`, or a hand-written `await Promise.all([...])` - is not supported. On `browser`/`rn` it fails the build immediately. A hand-written `await Promise.all(...)` gets its own dedicated error even on the server, since that exact shape is something the compiler generates for you - see "Independent awaits are combined automatically" below.

`await use...()` is also never supported inside an object or class method, on any boundary - there is no sibling statement slot to insert a split-out method next to, so this always throws, regardless of `isServer`:

```tsx
// throws on both browser and server
const obj = {
  async Render() {
    const t = await useTranslation('common')
    return <Text>{t('hello')}</Text>
  },
}
```

Use a plain function or arrow component/hook instead (`const Xxx = async () => {}`).

The plugin's own `isServer` option is set straight from the bundler's own server/not-server split - see next-config/index.ts's webpack `isServer` callback and Turbopack's `browser` / `not: 'browser'` rule condition, which is what actually compiles every file twice, once per side. `isServer: true` covers both `rsc` and `ssr` (both are "not browser", both run in Node), so the plugin skips stripping and keeps a real `await` for both. `isServer: false` covers `browser` (and React Native's own babel config always passes `isServer: false` too, since it has no Node-side pass at all), so both get stripped to sync.

This means a `'use client'` component's own two compiles genuinely differ: its `ssr` compile keeps the real `await use...()`, its `browser` compile has it stripped to a plain `use...()` call. Both produce the same observable result, since the hook itself resolves to the same value either way - the difference is invisible from the component's own code.

See packages/devtools/babel-plugin-async-hook/index.test.ts for the exact rules as executable examples - the `describe.each` "shared checks" block covers everything in this section, since all of it throws identically regardless of `isServer`.

## Independent awaits are combined automatically

On the server, two or more `await use...()` declarations that are adjacent (nothing else sits between them) and independent of each other (neither reads a value the other produced) are combined automatically into a single `await Promise.all([...])`:

```tsx
// source
const Header = async () => {
  const t = await useTranslation('common')
  const user = await useCurrentUser()
  return (
    <Text>
      {t('title')}
      {user.name}
    </Text>
  )
}

// compiled for rsc/ssr
const Header = async () => {
  const [t, user] = await Promise.all([
    useTranslation('common'),
    useCurrentUser(),
  ])
  return (
    <Text>
      {t('title')}
      {user.name}
    </Text>
  )
}
```

This is why writing `await Promise.all(...)` by hand is a build error (see above) - the compiler needs to own that shape to keep generating it correctly, and on `browser`/`rn` it would make no observable difference anyway, since every await is stripped identically regardless of grouping.

If two independent awaits are _not_ adjacent - something else sits between them, even a statement that depends on neither - the build fails instead of silently leaving a slower sequential waterfall in place:

```tsx
// throws - `banner` doesn't depend on `category` or `products`, but `products`
// (which does depend on `category`) sits between them, so `banner` can't be
// auto-combined with `category` without moving code
const ProductPage = async () => {
  const category = await useCategory()
  const products = await useProducts(category)
  const banner = await useBanner()
  return (
    <View>
      {products.length}
      {banner}
    </View>
  )
}
```

The fix is always the same: move the independent one up so it is adjacent to the other independent await(s), and it gets auto-combined:

```tsx
const ProductPage = async () => {
  const category = await useCategory()
  const banner = await useBanner()
  const products = await useProducts(category)
  return (
    <View>
      {products.length}
      {banner}
    </View>
  )
}
```

"Independent" is judged only against names an _earlier hook decl in the same run_ produced - reading a prop or an outer-scope variable doesn't disqualify a decl from counting as independent. See the waterfall tests (and the `describe.each` "shared checks" tests) in packages/devtools/babel-plugin-async-hook/index.test.ts for the exact adjacency/independence rules, including that case.

## Async hooks vs client hooks

There are two different kinds of hooks in play here, and mixing them in the same component is a common source of confusion:

- **Async framework hooks** (`useTranslation`, `useCurrentDirection`, `useIsRtl`, `useFetch`, ...) - always named `use...`, always called as `await use...()`. Which implementation runs depends on the _file_, not the current pass: an `rsc`-only file (no `'use client'`) uses the header-reading, cache-backed implementation; a `'use client'` file always uses the URL-parsing browser implementation, in both its `ssr` and `browser` compiles; an `rn` file uses the i18next/storage one. The call site looks identical everywhere. A component that _only_ calls these can stay in the `rsc` boundary - no `'use client'` needed.
- **Real React/DOM hooks** (`useState`, `useEffect`, `useRef`, `useContext`, ...) - these are never touched by the async-hook transform, and only work in a Client Component (`ssr`, `browser`, `rn`) - never in `rsc`. React itself enforces this, not this framework.

packages/devtools/eslint-plugin-custom/enforce-use-client (config in packages/devtools/eslint/config-enforce-use-client.ts) auto-adds `'use client'` the moment a file imports one of the real hooks above, or references a browser-only global (`window`, `document`, ...). Async framework hooks are deliberately absent from that list, since they are meant to work in the `rsc` boundary as-is, and get stripped to sync automatically for `ssr`/`browser`.

The tradeoff: if a single file both `await use...()`s a framework hook _and_ calls `useState`/`useEffect`, the eslint rule forces `'use client'` on the whole file. It still works correctly (see above - both its `ssr` and `browser` compiles are valid), but that file can now never be picked up by the `rsc` boundary - the framework-hook resolution rides along into `ssr`/`browser` with the stateful logic, even though it did not need to. It also means the two concerns cannot be reused or tested independently of each other.

## Splitting a component: the Button example

A component can freely mix an awaited framework hook with a real one, in one function, written exactly like this:

```tsx
'use client'

export const Button = async (props: ButtonProps) => {
  const rtl = await useIsRtl()
  const [pressing, setPressing] = useState(false)
  // ...cva, ripple, press state - everything that needs a real client hook
}
```

That single function is not actually valid as written: its `ssr` compile keeps a real `await useIsRtl()`, and React never allows a real hook (`useState`, `useEffect`, ...) inside an async function component - only Server Components may be async, and Server Components can never call client hooks. Left alone, this throws the moment `ssr` renders it.

**This split is now done automatically.** packages/devtools/babel-plugin-async-hook detects the mix (a leading run of `await use...()` framework-hook declarations followed by a real hook call) and rewrites it, for the `rsc`/`ssr` compile only, into an async wrapper that keeps the `await` plus a synchronous inner component that keeps the real hook - the same shape this doc used to tell you to hand-write:

```tsx
// generated for rsc/ssr - browser/rn instead strip the wrapper's own await,
// per "What the transpile actually supports" above
export const Button = async props => {
  const rtl = await useIsRtl()
  return <_Button _rtl={rtl} {...props} />
}

const _Button = ({ _rtl: rtl, ...props }) => {
  const [pressing, setPressing] = useState(false)
  // ...cva, ripple, press state
}
```

See packages/devtools/babel-plugin-async-hook/index.test.ts for the exact rules the transform applies: only a leading run of `const x = await use...()` declarations, starting at the very first statement, is eligible; the single param can be a plain identifier or any object pattern, nested or not (`{ foo, meta: { bar }, ...rest }`) - the wrapper swaps it for a fresh plain identifier, recovers the original bindings from it via an injected `const <pattern> = <id>` statement, and forwards the whole thing to the inner component with a single `{...id}` spread, so there is nothing about the pattern's own shape to individually understand; a real hook has to actually be present to trigger a split at all; and a lowercase-first name is left untouched since it is not a component by convention.

Two shapes can't be split automatically, and the plugin fails the build rather than silently leave them as invalid async-plus-real-hook code:

**Ordering relative to the function's own first `await` is what makes a real hook safe or unsafe - not what any later `await` depends on.** Confirmed empirically against `react-dom`'s `renderToPipeableStream`: React's hook dispatcher survives up to a function's first `await` and no further. A real hook called _before_ that point is safe no matter what happens after; one called _after_ it is broken no matter how deeply it's nested or what produced the value it needs:

```tsx
// safe, compiles unchanged - useState runs before this function's first
// await, so the dispatcher is still valid there. `data` merely depends on
// `id`'s *value*; that has nothing to do with dispatcher validity
const ProductCard = async props => {
  const [id] = useState(props.initialId)
  const data = await useProduct(id)
  return <View>{data}</View>
}
```

```tsx
// throws - the *second* useState is the broken one: it runs after this
// function's first await. The first useState, before the await, is fine on
// its own (see above)
const ProductCard = async props => {
  const [id] = useState(props.initialId)
  const data = await useProduct(id)
  const [label] = useState(data)
  return <View>{label}</View>
}
```

The same rule applies inside a hook composing other hooks, not just a component - and there, the plugin can't split anything (a hook has no JSX tree to split into), so it fails the build outright instead of leaving it broken:

```tsx
// throws - useState runs after this hook's own first await, same rule as
// above - but a hook host has no wrapper/inner split available, so this can
// never be fixed automatically the way a component can
const useStatefulLabel = async () => {
  const t = await useTranslation('common')
  const [count, setCount] = useState(0)
  return t('label') + count
}
```

The fix for a hook is always to reorder: move every real hook call before the hook's own first `await use...()`. Since it's ordering, not data dependency, that matters, this is always possible unless the real hook itself needs a value only the await produces:

```tsx
const useDarkModeState = async () => {
  const mounted = useIsMounted()
  const os = useColorScheme() // moved before the await - was after it
  const user = await useDarkModeUser()
  if (!mounted) {
    return
  }
  return toClassNameDarkModeState(darkModeCompose(user, os))
}
```

**A plain statement sitting between two `await use...()` decls also blocks the split**, even when the two awaits have no dependency on each other at all - the leading run has to be contiguous from the very first statement, so anything not shaped like `const x = await use...()` ends the run right there, and any further await-hook call is then stuck in the (non-async) inner component:

```tsx
// throws - `getAvailableThemes()` between the two awaits stops the leading run
// after the first one, so `await useTheme()` would end up in the inner
// component instead of the wrapper, still awaiting inside a non-async
// function - a real hook (useSetTheme) is present too, so this can't just be
// left fully async either
const ThemeSwitcher = async () => {
  const t = await useTranslation('common')
  const themes = getAvailableThemes()
  const theme = await useTheme()
  const setTheme = useSetTheme()
  return <Text>{t('theme')}</Text>
}
```

This one always has the same manual fix: if the interrupting statement doesn't depend on anything the later `await` produces (`getAvailableThemes()` here takes no arguments and doesn't touch `theme`), just reorder it after the awaits so the leading run is contiguous - the same rule applies if a plain statement (or a real hook call) is the very first statement in the function, before any `await use...()` at all:

```tsx
const ThemeSwitcher = async () => {
  const t = await useTranslation('common')
  const theme = await useTheme()
  const themes = getAvailableThemes()
  const setTheme = useSetTheme()
  return <Text>{t('theme')}</Text>
}
```

That reordered version splits automatically. If the interrupting statement genuinely depends on something only a later hook or the eventual client state can provide, it can't be reordered - fall back to the manual file split shown further below instead.

Neither throw fires when there is no real hook to protect in the first place - a stray, non-contiguous `await use...()` (with or without a variable declaration) with no `useState`/`useEffect`/... anywhere is left fully async exactly as written, non-contiguous awaits and all, since there is nothing invalid about that on its own:

```tsx
// left as-is on the server - no real hook anywhere, so the stray bare await
// (nothing assigned) changes nothing
const Foo = async () => {
  const t = await useTranslation('common')
  await useTrackView()
  return <Text>{t('hi')}</Text>
}
```

On `browser`/`rn` a stray bare `await use...()` strips to a plain call exactly like any other awaited hook, assigned or not:

```tsx
const Foo = () => {
  useTrackView()
  return <Text>hi</Text>
}
```

**What the automatic split does _not_ do** is move `Button` back into the `rsc` boundary - the whole file is still `rsc: false` because of `'use client'`, and the generated wrapper still re-runs `useIsRtl` on every `ssr`/`browser` pass together with the stateful logic, not just once in `rsc`. That is fine for a small leaf component like this one. If a component's `rsc`-resolvable work (direction, translations, ...) is expensive or reused enough to be worth keeping out of `ssr`/`browser` entirely, splitting the real-hook logic into its own _file_ is still a manual, deliberate choice:

```tsx
// button-client.tsx - 'use client', only real hooks, no i18n awareness at all
'use client'
export const ButtonClient = ({
  groupFirst,
  groupLast,
  rtl,
  ...props
}: ButtonProps & { rtl: boolean }) => {
  const [pressing, setPressing] = useState(false)
  // ...cva, ripple, press state
}

// index.tsx - no 'use client', can be a real Server Component
import { ButtonClient } from '#/core/components/button/button-client'
import { useIsRtl } from '#/core/i18n/use-is-rtl'

export const Button = async (props: ButtonProps) => {
  const rtl = await useIsRtl()
  return <ButtonClient {...props} rtl={rtl} />
}
```

`index.tsx` would then only import `useIsRtl` (an async framework hook) and `ButtonClient`, so `enforce-use-client` would leave it alone, and it would move back into the `rsc` boundary wherever `Button` is rendered from one. `button-client.tsx` only imports real hooks, so it stays unambiguously `'use client'`, trivial to test or reuse without touching i18n at all.

Reach for the file split when a component's `rsc`-resolvable work is worth keeping out of `ssr`/`browser` entirely; otherwise, just write the component as one mixed function and let babel-plugin-async-hook handle it.

## FAQ

**Does `'use client'` mean this file only runs in the browser?**
No. It means `rsc: false` - not a Server Component. It still runs on the server once, during `ssr`, to produce the initial HTML, before it ever reaches a browser. "Client" describes which rendering model applies (a hydratable Client Component vs. a one-shot Server Component), not which machine executes the code.

**Why do so many people (and AI) get this wrong?**
Mostly the name itself - "client" reads as "browser" in everyday dev vocabulary, and pre-RSC React/Next.js only ever had that binary (server renders once, client is the browser), so there was never a third bucket to learn. Most getting-started guides teach "add `'use client'` when you need `useState`/`onClick`" and stop there, since the `ssr` pass "just works" silently with no error forcing anyone to notice it exists. AI models trained on that same body of docs/blogs inherit the same gap.

**So can a `'use client'` component really use `async`/`await` then?**
Only through this framework's own hook convention (`await use...()`), and only because babel-plugin-async-hook strips it to a plain call for the `browser` (and `rn`) compile. A literal `async function` Client Component is not something React itself supports rendering in the browser - real `async` is only valid in `rsc`, and, for the one `await use...()`/`await Promise.all([...])` shape this plugin recognizes, in `ssr` too.

**Is `'use server'` the Server Component equivalent of `'use client'`?**
No - that is a different, easily-confused directive for marking a Server Action (a function callable from the client that runs on the server), not a Server Component. Server Components need no directive at all; they are the default for any file without `'use client'`.

**Is it safe to mix a real hook (`useState`) and an async framework hook (`await useIsRtl()`) in the same `'use client'` file?**
Yes, it runs correctly - see "Splitting a component" above. The only cost is architectural: that file can never be picked up by the `rsc` boundary anymore, since `'use client'` forces the whole file, hooks and all, into `ssr`/`browser`.

**If `browser` can support real async components via Suspense, why does this framework strip it anyway?**
Because `rn` cannot support it at all, and the framework wants exactly one hook shape everywhere. Rather than give `browser` its own third code path, it is deliberately held to the same "no real async" rule as `rn`, so the exact same compiled call works on both.
