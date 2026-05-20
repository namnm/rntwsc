# React Native - Tailwind - NextJS

React Native with Tailwind CSS class names, compatible with NextJS App Router SSR stream. This repository is currently serving as a boilerplate. It also includes a playground example with a full combination with NextJS.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Tailwind](#tailwind)
  - [Common extras](#common-extras)
  - [Special props](#special-props)
  - [Selectors](#selectors)
  - [Minify](#minify)
  - [Convention](#convention)
- [RSC + SSR](#rsc--ssr)
  - [Client extension](#client-extension)
  - [Async components](#async-components)
  - [Context](#context)
- [I18n](#i18n)
- [Theme](#theme)
- [Navigation](#navigation)
  - [Adding a route](#adding-a-route)
  - [Navigating with Link](#navigating-with-link)
  - [Reading the current route](#reading-the-current-route)
- [Image](#image)
- [SVG](#svg)
- [HTML semantic & accessibility](#html-semantic--accessibility)
- [Appendix](#appendix)
  - [Turbopack](#turbopack)
  - [Patch react-native-web](#patch-react-native-web)
  - [I18n internals](#i18n-internals)
  - [Navigation internals](#navigation-internals)
  - [VS Code Intellisense](#vs-code-intellisense)
- [License: MIT](#license-mit)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

---

### Tailwind

- All styles are transpiled from class name strings to objects at build time using a babel plugin. Unsupported class names will be catched during the transpile process.
- The babel plugin uses twrnc under the hood. All class names valid in twrnc should be valid here as well, extra features will be described below. TODO: Move away twrnc to use a css config like uniwind.

```tsx
// transpile jsx class names to style object
// transpiled styles are moved to the root scope to avoid object creation on each render
// jsx prop `className` will be normalized and renamed to `style` through a wrapper component
const MyComponent = () => <View className='flex flex-col transition' />
// -> will be transpiled to:
const _style = {
  display: 'flex',
  flexDirection: 'column',
  transition: [
    /* .. */
  ],
  transitionDuration: 150,
  transitionTimingFunction: 'ease-in-out',
}
const MyComponent = () => <View style={_style} />

// support array in jsx
const MyComponent = ({ withTransition, className, ...props }: Props) => (
  <View
    {...props}
    className={['flex flex-col', withTransition && 'transition', className]}
  />
)
// -> will be transpiled to:
const _style1 = {
  /* .. */
}
const _style2 = {
  /* .. */
}
const MyComponent = ({ withTransition, className, ...props }: Props) => (
  <View {...props} style={[_style1, withTransition && _style2, className]} />
)

// transpile class names directly to store as a variable
// on web they will be kept as string
const style = tw`flex flex-col transition`
// -> will be transpiled to:
const style = {
  // ..
}

// support cva
// all class names in cva should be transpiled as well
const button = cva({
  className: '..',
  // support multiple class names
  classNames: {
    button: '..',
    text: '..',
  },
  attributes: {
    // similar to cva variants
    attr1: {
      value1: '..',
    },
    attr2: {
      value2: {
        // support multiple class names
        button: '..',
        text: '..',
      },
    },
  },
  compoundVariants: [
    // similar to cva compoundVariants
    {
      attr1: 'value1',
      attr2: 'value2',
      className: '..',
      // support multiple class names
      classNames: {
        button: '..',
        text: '..',
      },
    },
  ],
})

// similar to the official suggestion from cva:
type Props = Parameters<typeof button>[0]
type Props = Variant<typeof button>

const MyComponent = (variant: Props) => {
  const cn = button(variant)
  return (
    <Pressable className={cn.button}>
      <Text className={cn.text}>CVA Button</Text>
    </Pressable>
  )
}

// support clsx
// all string class names in clsx should be transpiled as well
const composed = clsx(
  'flex flex-col',
  withTransition && 'transition',
  className,
)

// support runtime conversion from class names to styles, also work on web
// this is not recommended, but can be useful in some cases
// NOTE: these class names are not captured by the babel plugin and postcss-rename
const style = runtimeStyle('flex flex-col')

// support runtime conversion from class names to styles in jsx
// this is not recommended, and will be warned during development mode
// NOTE: these class names are not captured by the babel plugin and postcss-rename
const classNameStringFromSomeWhere = 'flex flex-col'
const MyComponent = () => <View className={classNameStringFromSomeWhere} />
```

#### Common extras

- Support transition using Reanimated:
  - `transition`
  - `transition-all`
  - `transition-colors`
  - `transition-opacity`
  - `transition-shadow`
  - `transition-transform`
  - `transition-none`
  - `transition-[<value>]`
  - `duration-<number>`
  - `duration-initial`
  - `ease-linear`
  - `ease-in`
  - `ease-out`
  - `ease-in-out`
  - `ease-initial`
  - Custom easing:
    - Add new easing to `tailwind.theme.extend` in tailwind.config.cjs
    - Add new easing to `transitionTimingFunctionMap` in normalize-style-config.ts
  - `delay-<number>`
- Support animation using Reanimated:
  - `animate-spin`
  - `animate-ping`
  - `animate-pulse`
  - `animate-bounce`
  - Custom animation:
    - Add new animation to `tailwind.theme.extend` in tailwind.config.cjs
    - Add new animation to `animationMap` in normalize-style-config.ts
- Support basic grid columns using computed layout:
  - `grid`
  - `grid-cols-none`
  - `grid-cols-<number>`
  - `grid-cols-[..px_..fr]`
  - `gap`
  - `gap-x`
  - `gap-y`
  - Only available within View.
- Support shorthand transform:
  - `translate-`
  - `rotate-`
  - `scale-`
  - TODO: Each shorthand will be partial merged into the transform array
- Support viewport width height:
  - `<property>-[<number>vw]`
  - `<property>-[<number>vh]`
  - `<property>-screen`
- Support basic calc:
  - `<property>-[calc(<expr>)]`
  - Supported operators: + - \* /
  - Supported units: px, vw, vh

#### Special props

- Support clamping text:
  - `line-clamp-<number>`
  - `line-clamp-none`
  - Will be transpiled to `numberOfLines` and passed through props.
- Support selectable text:
  - `select-text`
  - `select-none`
  - Will be transpiled to `selectable` and passed through props.
- Support placeholder text color:
  - `placeholder-<color>`
  - Will be transpiled to `placeholderTextColor` and passed through props.
  - Under the hood it will get `text-<color>` style using twrnc and map the color to the prop.
- Support caret hidden:
  - `caret-transparent`
  - Will be transpiled to `caretHidden` and passed through props.
- Support object fit:
  - `object-contain`
  - `object-cover`
  - `object-fill`
  - `object-none`
  - `object-scale-down`
  - Will be transpiled to `resizeMode` and passed through props.

#### Selectors

- Support platform selector: `web:`, `ios:`, `android:`, `native:`. It will be striped out at build time if the platform doesnt match.
  - On web we need to define a custom variant in global css to take precedence.
  - Automatically strip out class names that are not compatible in native:
    - `theme-`
    - `web:`
    - `web-`
    - `hover:`
    - `group-<key>-hover:`
    - `peer-<key>-hover:`
    - `cursor-`
- Support color scheme selector: `dark:`, `light:`.
- Support responsive screen size selector: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`.
- Support event handler selector: `active:`, `focus:`.
  - Any component with onPressIn onPressOut such as Pressable will support `active:`.
  - Any component with onFocus onBlur such as TextInput will support `focus:`.
- Support props selector: `disabled:`, `checked:`.
  - Need to pass those fields to hook options: props, childrenProps.
- Support group selector: `group-<selector>:`, `group-<key>-<selector>:`.
- Support peer selector: `peer-<selector>:`, `peer-<key>-<selector>:`.
  - Need to use TwPeerProvider to isolate the context if there are many peers in the same page. The provider is simply a Fragment re-export on web.
- Support nested selector: `<selector1>:<selector2>:..:<class-name>`. Nested selector with deeper level will take precedence.
- Selectors are handled using hooks and have no problem such as twrnc memoBuster. The hooks are only needed in react native, thus it will not introduce client component in web.

#### Minify

- Class names on web can be minified using [postcss-rename](https://github.com/google/postcss-rename) since the babel plugin has captured all usage references.
- See example playground `app-nextjs/postcss.config.js` will emit minified class names json map to `app/src/codegen/class-names.min.json`

#### Convention

- `cva` signature is similar to [cva](https://cva.style/docs/getting-started/variants) with some differences and extras. To follow with real life standards and avoid confusion, we will redefine the terms as follows:
  - `Attribute` is similar to a react property. We name it attribute differentiate with other react properties such as event handlers.. An attribute defines a specific characteristic of that component. For example: color, size, shape..
  - `Attribute value` is a value of an attribute. For example with color: red, green, blue..
  - `Variant` is a combination of all attributes with their coresponding values. For example with 2 attributes color and size: color=red size=xs, color=green size=lg.. So if color has 3 values and size has 4 values, the total number of variants is 3x4=12.
  - No default variant, values should be set in default props instead
- All class names in cva, clsx, tw tagged, jsx className should be general string literal without any operator. With clsx and jsx, we support variable and some operators to cover the most needs. The compiler should check all the compatible for you automatically.

---

### RSC + SSR

#### Client extension

Similar to react native metro variant `.native` `.ios` `.android` extension alias resolve strategy, we also support `.client` extension in the client bundle, using a custom babel and webpack plugin to transpile the import path: `babel-plugin-client-extension`, `webpack-resolve-client-extension`

To bypass rsc metadata validation as it happens before the babel process, we need to alias next modules such as `next/..` to be `next-unchecked/..`. We should use another babel plugin to validate these cases: `babel-plugin-rsc-validation`

The transpiled code could be cached. If we add or remove a `.client` file, it will not be resolved correctly as the previous transpiled import path is cached, we need to remove the cache folder `.next` and restart the development server. This is an acceptable trade off since this scenario does not come up often.

To make sure all variants should export the same set of functionalities, we also have a custom eslint rule to check if there is mismatch export between variants and default: `custom/no-missing-export`. This rule also allows different exports in some edge cases, name the variable with cresponding variant suffix to bypass, for example `somethingNative` will not be reported in the `.native` variant.

This is currently not working with `.web.client` extension, and we intentionally support only `.client`: as the server implementation is broader with async components, we should prioritize server implementation first as the default if there is difference, then client, and native last.

#### Async components

To reuse async components in client and native bundle, we will use a custom babel plugin to transpile async components into non-async versions, together with the extension alias resolve strategy above. This will only transpile async components contains `await use..` hooks:

```tsx
import { useTranslation } from '@/i18n'

export const Hello = async () => {
  const t = await useTranslation('common')
  return <Text>{t('hello')}</Text>
}

// -> will be transpiled to:

import { useTranslation } from '@/i18n/index.client'

export const Hello = () => {
  const t = useTranslation('common')
  return <Text>{t('hello')}</Text>
}
```

#### Context

There should be no global Context as it marks the whole children as client bundle and destroys the purpose of app router ssr stream.

- In server bundle we will only use async methods such as `next/headers`, `fetch`..
- In client bundle we will try to have the same set of exports using `next/navigation`, singleton and `useSyncExternalStore`..
- In native bundle we can use Context and add the provider at the top native entry point.

---

### I18n

I18n is already set up and configured to work on all variants: server, client, native.

**Using translations in a component**

```tsx
import { useTranslation } from '#/i18n'

export const MyComponent = async () => {
  const t = await useTranslation('home')
  return <Text>{t('description')}</Text>
}
```

**Adding a translation key**

Add the key to each language's JSON file under `i18n/labels/<lang>/<namespace>.json`:

```json
// labels/en/home.json
{ "greeting": "Hello" }

// labels/ja/home.json
{ "greeting": "こんにちは" }

// labels/zh/home.json
{ "greeting": "你好" }
```

**Adding a new namespace**

Create `labels/<lang>/<namespace>.json` for each language, then register it in `labels/index.ts`:

```ts
export const labels = {
  en: { home: enHome },
  ja: { home: jaHome },
  zh: { home: zhHome },
} as const
```

TypeScript infers `'home'` as a valid `Namespace` automatically - no extra config needed.

**Adding a new language**

Add an entry to `languages` in `i18n/config.ts` and create the corresponding label files:

```ts
export const languages = [
  { locale: 'en-US', nativeName: 'English' },
  { locale: 'ja-JP', nativeName: '日本語' },
  { locale: 'zh-CN', nativeName: '中文' },
] as const
```

**Language switcher**

`I18nSwitcher` is a ready-made component - drop it anywhere. It renders locale-prefixed links on web and pressable buttons on native with no extra wiring required.

```tsx
import { I18nSwitcher } from '#/i18n/i18n-switcher'

export const MyPage = async () => (
  <>
    <Content />
    <I18nSwitcher />
  </>
)
```

---

### Theme

Theme and dark mode is already set up and configured to work on all variants: server, client, native. 10 themes included in the built in, adaptive with dark mode.

---

### Navigation

Navigation works across all variants (server, client, native) with a unified API.

#### Adding a route

Routes shared between RN and Next.js - add the path constant, register it in both routers:

```ts
// apps/playground/app/src/pages/route-paths.ts
export const rHome = '/'
export const rProfile = '/profile' // add here

// apps/playground/app/src/pages/routes.ts
import { ProfilePage } from '#/pages/profile'
import { rHome, rProfile } from '#/pages/route-paths'

export const routes = {
  [rHome]: HomePage,
  [rProfile]: ProfilePage, // register for RN
}
export type RoutesData = {
  [rHome]: never
  [rProfile]: { userId: string } // query params, or `never` if none
}
```

```
// create the page file for Next.js at:
apps/playground/app-nextjs/src/app/[locale]/profile/page.tsx
```

RN-only routes - add to `route-paths.ts` and `routes.ts` only, no Next.js page needed.

Next.js-only routes - create the page file under `app-nextjs/src/app/[locale]/` only, no entry in `routes.ts` needed.

#### Navigating with Link

Use the typed `Link` from `#/components/link`. The `pathname` prop is constrained to registered routes, and `query` is typed per route:

```tsx
import { Link } from '#/components/link'

// route with no params - query can be omitted
<Link pathname={rHome}>Go home</Link>

// route with required params - query is required and typed
<Link pathname={rProfile} query={{ userId: '123' }}>Profile</Link>
```

#### Reading the current route

```tsx
import { useRoute, useIsRouteFocused } from '@/rn/core/navigation'

const { pathname, query } = await useRoute()
const focused = useIsRouteFocused() // always true on web, useIsFocused() on native
```

---

### Image

Image component is aliased using `react-native-fast-image` in native and a plain html `img` tag in nextjs. `resizeMode` should be supported using tw class names such as `object-*`. Other nextjs image features such as auto generated ratio, optimization.. should be done on the backend api level and supply here through tw class names, src set..

---

### SVG

SVG can be imported directly into the code as react component thanks to svgr loader. It will render with width equals to font size and height equal to line height. Color should be configured in the svg with `currentColor` to inherit automatically. The prop `style` will be omitted on web, always use `className` to style it instead.

---

### HTML semantic & accessibility

Beside the official semantic props such as `accessibilityRole`, `aria-*`.. we also have `rnwTag` to customize the html tag for the base components.

---

### Appendix

#### Turbopack

This is currently working with webpack only, as turbopack use esm module and collect the rsc metadata single unified graph for all environments, and it is not supported to directly use typescript in commonjs, but react native requires commonjs. We can support turbopack by having extra build steps:

- All packages must be prebuilt to commonjs first
- Generate css theme variables in js in the build step
- Use resolveAlias glob all .client extension files in nextjs config
- Require to rebuild css or restart nextjs everytime adding/removing any .client file, but this is acceptable

Additionally, turbopack also has some known issues with bundle chunks size, and with the nature of react native commonjs, it is not recommended to support turbopack for now.

#### Patch react-native-web

- By default, react-native-web has the following limitation:
  - Styles are runtime generated and injected to head, which overrides the tailwind css.
  - Need to extract style on ssr render, which is incompatible or inefficient with nextjs app router ssr stream.
  - Class names are omited from props.
- We will patch react-native-web to allow className and introduce a new prop to compute className instead of using react native style sheet, and more to support custom html tag. Only some critical components are being patched: Text, View, ScrollView, Pressable, TextInput, FlatList. Those components are also exported with reanimated support in react native.
  - Add rnwTag, rnwClassNameData, className in forwardedProps
  - Update logic in createElement to use rnwTag
  - Add rnwClassNameData to each components being patched
  - Update logic in createDOMProps to call a global function rnwClassName. We can not pass function as prop in app router ssr stream. The global function was injected in src/polyfill/react-native.ts
  - There could be better way to handle these, but let's just leave it for now..
- Props with prefix data- will be merged into dataSet as react native web only support this prop.

#### I18n internals

The core framework lives in `framework/rn/core/i18n` with platform-specific entry points:

- `index.tsx` - server components: async hooks that read the `x-i18n-locale` request header (set by Next.js middleware), wrapped in React `cache()` for request-level memoization
- `index.client.tsx` - client components: sync hooks that parse the locale from the URL pathname
- `index.native.tsx` - React Native: hooks backed by the i18next instance; exports `I18nProviderNative` (wraps the app with `I18nextProvider`) and `initI18nNative()` (initializes i18next and reads the persisted locale from AsyncStorage)

Language switching is handled by `use-i18n-switcher-props.tsx` (web) and `use-i18n-switcher-props.native.tsx` (native). On web, switching navigates to a locale-prefixed URL that Next.js middleware intercepts to set the locale cookie. On native, it calls i18next directly and writes the new locale to AsyncStorage.

App startup calls `setLocales()` and `setI18nLabels()` once via `polyfill/set-i18n.ts`, which is imported at the top of each platform's polyfill entry (`polyfill/server.ts`, `polyfill/native.ts`). All subsequent framework calls read from that shared module state.

The framework uses an "Untyped" naming convention for generic exports (`useTranslationUntyped`, `isValidLocaleUntyped`..) so each app wraps them with its own strict locale/namespace types in `i18n/index.ts` without coupling the core to any specific locale set.

#### Navigation internals

The core framework lives in `framework/rn/core/navigation` with platform-specific entry points:

- `index.ts` - server components: reads the current URL from the `x-request-url` header (set by Next.js middleware), strips the locale prefix, parses query params; `useIsRouteFocused()` always returns `true`
- `index.client.ts` - client components: sync hooks using `usePathname()` and `useSearchParams()` from `next-unchecked/navigation`; `useIsRouteFocused()` always returns `true`
- `index.native.ts` - React Native: wraps `useRoute` and `useIsFocused` from `@react-navigation/native`, mapping `route.name` -> `pathname` and `route.params` -> `query`

RN and Next.js are separate bundles with separate routing strategies. For RN, `routes.ts` is passed to `createNativeStackNavigator({ screens: routes })` in `app.native.tsx` and wrapped with `createStaticNavigation`. For Next.js, routing is entirely handled by the folder structure under `pp/[locale]/` - no extra registration needed. `route-paths.ts` is kept separate from `routes.ts` to avoid circular imports between the route map and page components.

The `Link` component at `apps/playground/app/src/components/link.tsx` wraps the framework's `LinkUntyped` with the app's own `Routes` and `RoutesData` types. On web it delegates to `next/link` and prepends the current locale to the pathname when needed.

#### VS Code Intellisense

```json
{
  "tailwindCSS.classFunctions": ["tw", "cva", "clsx"]
}
```

---

### License: MIT

Contact me at [nam@namnm.com](mailto:nam@namnm.com)
