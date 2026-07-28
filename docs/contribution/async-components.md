<!-- START doctoc -->

- [Async components implementation](#async-components-implementation)
  - [The four boundaries, and where isServer comes from](#the-four-boundaries-and-where-isserver-comes-from)
  - [babel-plugin-async-hook](#babel-plugin-async-hook)
  - [enforce-use-client](#enforce-use-client)
  - [Why browser is grouped with rn instead of ssr](#why-browser-is-grouped-with-rn-instead-of-ssr)

<!-- END doctoc -->

# Async components implementation

See async-components.md for the consumer-facing usage and the four-boundary mental model (rsc, ssr, browser, rn). This doc covers where each boundary's `isServer` value actually comes from in this repo's own build config, and why the babel plugin's binary check is enough to model four boundaries with only two values.

## The four boundaries, and where isServer comes from

packages/devtools/babel-config/index.ts's `config()` takes a single `isServer?: boolean` and forwards it, unchanged, to both browserValidationPlugin and asyncHookPlugin. It never inspects the `'use client'` directive - `isServer` is the only signal either plugin ever sees.

For `target: 'rn'` (Metro, packages/devtools/metro-config), `isServer` is hardcoded to `false` unconditionally - there is no server pass for React Native at all, so every file compiles as if it were `browser`.

For `target: 'nextjs'`, `isServer` is threaded through from the bundler itself, not decided by this framework:

- packages/devtools/next-config/index.ts's webpack config reads `isServer` straight from webpack's own `(config, { isServer }) => ...` callback - Next.js calls this once per each of its two standard compilations, and both `rsc`-only files and `'use client'` files rendering their `ssr` pass are compiled under the same `isServer: true` invocation (both are "server", i.e. Node, from webpack's own point of view - Next.js does not surface a third value for "SSR of a Client Component" here).
- The Turbopack config's rule condition is `isServer ? { not: 'browser' } : 'browser'` - same split, expressed as a Turbopack matcher instead of a webpack callback.

So in this repo's actual build config, there are only ever two babel passes for a Next.js target (`isServer: true` / `isServer: false`), even though there are four boundaries conceptually. `rsc` and `ssr` share the `isServer: true` pass; `browser` and `rn` share `isServer: false` (`rn` via its own hardcoded value, not through next-config at all).

## babel-plugin-async-hook

See async-components.md first for the consumer-facing rules (what shapes are supported, the empirically-verified hook-ordering rule, the waterfall auto-merge, and worked examples of every throw) - this section only covers what that doc doesn't: how packages/devtools/babel-plugin-async-hook/index.ts actually implements those rules.

packages/devtools/babel-plugin-async-hook/index.ts's `Program` visitor first collects every async function matching a supported shape (function declaration, function/arrow expression, object/class method) that contains a `use<PascalCase>(...)` call somewhere in its own scope, not nested inside another function - see `getHookOwnerFn`. Two checks run right there, before any `isServer` branching, so both boundaries throw identically: `isMethod` rejects `ObjectMethod`/`ClassMethod` outright, and `isValidHostName` (via `resolveFnName`) drops anything not PascalCase or `use...`-named - a lowercase-first or anonymous function is never candidate at all, since React/JSX could never render it as a component to begin with.

Both `stripToSync` (isServer: false) and `trySplitServerComponent` (isServer: true) call `checkNoExplicitPromiseAll` first - a `parentFn.traverse` that skips into any nested `Function` (so a Promise.all inside a callback or nested component doesn't count) and throws on any `AwaitExpression` whose argument is `Promise.all(...)` specifically (`isPromiseAllCall`, a narrow member-expression check, not any other `.all(...)` call).

For `isServer: false` (`browser` and `rn`), each candidate is walked and, for every `CallExpression` shaped `use<PascalCase>(...)` sitting directly under an `await` (or `yield`):

1. Strips the `await`/`yield` wrapping that call (see `stripAwaitOrYield` - anything else awaited in that same function throws `Only support \`await use...()\``, since the Promise.all case is already rejected by the shared check above)
2. Sets the enclosing function's `async` flag to `false`

It does not touch the function body otherwise - any `useState`, `useEffect`, etc. calls inside are left completely alone, since they were never `await`ed to begin with and are not named to match a hook wrapped in `await`.

For `isServer: true` (`rsc` and `ssr`), `trySplitServerComponent` runs the following, in order:

1. `mergeAdjacentIndependentAwaits` finds runs of 2+ adjacent `const x = await use...()` declarations (`getAwaitHookDecl`) that are mutually independent (`isIndependentDecl` - true when a declaration's own init references no name bound by an _earlier declaration in the same run_; a name from outside the run, e.g. a prop or module-scope value, never counts against independence) and rewrites each run into one `const [pat1, pat2, ...] = await Promise.all([init1, init2, ...])` (`mergeIntoPromiseAll`). It re-scans the whole body from scratch after every merge, since indices shift - O(n^2) in the pathological case, fine for the small function bodies this applies to.
2. `checkForWaterfall` then scans every remaining awaited-hook declaration in declaration order; a second "root" (independent of everything declared so far) after the first one throws, since fixing it would require moving code across whatever sits between them - something the compiler won't do silently.
3. `findOwnAwaitedHookCall` locates the function's own first awaited-hook statement (`firstAwaitIdx`) - unlike the leading-run scan in step 6, this matches a bare `await use...()` with no assignment too. No match at all means this candidate is a no-op.
4. `findOwnHookCall` is mapped over every statement after `firstAwaitIdx` (skipping nested functions and any already-awaited hook call) to find a real, un-awaited `use...()` call - `unsafeRealHook`. Its absence leaves the function exactly as written; only its _position_ relative to `firstAwaitIdx` is checked, never what any later await depends on.
5. If the candidate's own name matches the hook regex (`isHookHost`), a present `unsafeRealHook` always throws right here - a hook has no JSX tree to split into, so there is no automatic fix.
6. Otherwise (a component), the leading-run scan builds `dataDecls`: starting strictly at statement index 0, each statement must be exactly `const <pattern> = await use...()` (single declarator, `const` kind, `AwaitExpression` init whose callee matches the hook regex or is a merged `Promise.all(...)`) or the scan stops right there. Every statement past that point (`restPaths`) is checked via `findOwnAwaitedHookCall` for any further awaited-hook call that didn't make it into the leading run; a match throws immediately. In practice this is what fires for most "leading run couldn't even start" cases too (`dataDecls` empty, scan stopped at index 0) - `restPaths` then covers the entire body, including whatever statement `firstAwaitIdx` found in step 3, so the `findOwnAwaitedHookCall` check here catches it before the dedicated `dataDecls.length === 0` fallback throw below it ever gets a chance to.
7. The actual split (param handling via `createUniqIdent`/`resolveWrapper`, generating the wrapper + inner function pair) is unchanged in shape from before - see async-components.md's "Splitting a component" walkthrough, and index.test.ts for the exact param-pattern and naming rules as executable examples.

One direct consequence: a `'use client'` component's own `ssr` compile and `browser` compile are genuinely different artifacts. The `ssr` one keeps a real `await use...()` (split into a wrapper, if a real hook forced it); the `browser` one has the exact same line reduced to a plain `use...()` call, with no split needed since the whole function is already synchronous. Both resolve to the same value (the underlying `use...` hook's server vs. browser vs. native variant is chosen by import path - see browser-variant.md - independently of this plugin), so the difference is invisible to anything that isn't reading the compiled output directly.

## enforce-use-client

packages/devtools/eslint-plugin-custom/enforce-use-client.ts implements the opposite check: it looks for real hooks/globals (the lists in packages/devtools/eslint/config-enforce-use-client.ts) and auto-inserts `'use client'` the moment it sees one, via `Identifier`/`ImportDeclaration` visitors feeding a single `shouldEnforce` flag checked on `Program:exit`. It is a completely separate mechanism from asyncHookPlugin - one is a babel transform keyed on a bundler-supplied `isServer` boolean, the other is a static eslint check keyed on which specific identifiers a file imports or references. They agree in practice (a file using only async framework hooks stays eligible for `rsc`; a file using any real hook gets `'use client'` forced on), but neither one queries the other - there is no single source of truth being consulted twice, they are just two independently-arrived-at signals that happen to line up because framework hook names were deliberately kept out of the `enforce-use-client` lists.

## Why browser is grouped with rn instead of ssr

`ssr` and `browser` are not the same execution, and the framework does not treat them the same - `ssr` keeps a real `await`, `browser` does not. It would be technically possible to give `browser` its own third babel pass that also keeps real async component syntax (React does support this via Suspense/`use()` in the browser), but the plugin instead groups `browser` with `rn`'s `isServer: false` pass on purpose: `rn` cannot express async components at all, and the framework's one hook call shape (`await useX()` collapsing to `useX()`) needs to be something `rn` can run. Rather than have `browser` support one shape and `rn` require another, both get stripped identically, and the async form is reserved for the two boundaries where it is guaranteed to be available: `rsc` and `ssr`.
