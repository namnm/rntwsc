<!-- START doctoc -->

- [Navigation](#navigation)
  - [Add a route](#add-a-route)
  - [Link](#link)
  - [Read the current route](#read-the-current-route)
  - [Internals](#internals)

<!-- END doctoc -->

# Navigation

Works across server, browser, and native with a unified API.

## Add a route

```ts
// 1. playground/app/src/pages/route-paths.ts
export const rProfile = '/profile'

// 2. playground/app/src/pages/routes.native.ts - register page for RN
import { ProfilePage } from '@/pages/profile'
import { rProfile } from '@/pages/route-paths'
export const routesNative = {
  ...,
  [rProfile]: ProfilePage,
}

// 3. playground/app/src/pages/routes.ts - declare params, only needed when
// the route has typed query params, omit the entry entirely otherwise
export type RoutesData = {
  [rProfile]: { userId: string }
}

// 4. playground/turbopack/src/app/locale/profile/page.tsx - web page
export { ProfilePage as default } from '@/pages/profile'

// 5. playground/app/src/components/nav-layout/index.tsx - sidebar link
<NavSidebarLink href={rProfile} label='Profile' />
```

RN only route: skip steps 4 and 5.

Web only route: skip steps 2 and 3, add step 4 only.

## Link

```tsx
import { Link } from '@/components/link'

// no params
<Link pathname={rHome}>Home</Link>

// with params - query is typed per RoutesData
<Link pathname={rProfile} query={{ userId: '123' }}>Profile</Link>
```

## Read the current route

```tsx
import { useRoute, useIsRouteFocused } from '#/core/navigation'

const { pathname, query } = await useRoute()
const focused = useIsRouteFocused() // always true on web, useIsFocused() on native
```

## Internals

Platform entry points in packages/core/navigation/:

| File             | Used by            | How                                                                    |
| ---------------- | ------------------ | ---------------------------------------------------------------------- |
| index.ts         | Server components  | Reads the x-request-url header, strips the locale prefix, parses query |
| index.browser.ts | Browser components | usePathname and useSearchParams from next-unchecked navigation         |
| index.native.ts  | React Native       | Wraps useRoute and useIsFocused from react-navigation native           |

On native, routesNative is passed to createNativeStackNavigator and wrapped with createStaticNavigation in playground/app/src/app.native.tsx. On web, Next.js file system routing handles everything under playground/turbopack/src/app/locale/.

route-paths.ts is kept separate from routes.native.ts to avoid circular imports between the route map and page components.

The typed Link at playground/app/src/components/link.tsx wraps the framework's LinkUntyped with the app's Routes and RoutesData types. On web it prepends the current locale to the pathname.
