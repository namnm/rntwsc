# rntwsc

![npm version](https://img.shields.io/npm/v/rntwsc?label=npm) ![license](https://img.shields.io/badge/license-MIT-blue) ![type coverage](https://img.shields.io/badge/type--coverage-98.48%25-brightgreen) ![node](https://img.shields.io/badge/node-%3E%3D24.11-brightgreen) ![pnpm](https://img.shields.io/badge/pnpm-%3E%3D11-orange)

React Native with Tailwind CSS class names, compatible with Next.js App Router RSC and SSR streaming, plus a plain Vite SPA target. One component tree, three targets: web, native, and a client-only SPA. Class names are transpiled at build time on native and kept as-is on web.

<!-- START doctoc -->

- [Features](#features)
- [Best use cases](#best-use-cases)
- [Quick start](#quick-start)
- [Docs](#docs)
- [Contributing](#contributing)
- [License: MIT](#license-mit)

<!-- END doctoc -->

## Features

| Area           | What you get                                                                                                                                                    |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-platform | One component tree for Next.js App Router (RSC/SSR), a plain Vite SPA, and React Native                                                                         |
| Tailwind       | Real Tailwind class names in React Native, transpiled to style object at build time, kept as-is on web                                                          |
| Hydration      | useFetch and useFetchGraphQL: server data hydrates into client components, no second request, no loading flash                                                  |
| Theming        | Built-in themes and dark mode, cookie/storage backed, SSR-aware from the first paint                                                                            |
| I18n           | Namespaces, languages, RTL, and a switcher, wired through the same hydration model                                                                              |
| Components     | Accordion, Alert, Badge, Button, Checkbox, DatePicker, Drawer, Dropdown, Form, Modal, Radio, Select, Switch, and more - see [components.md](docs/components.md) |

## Best use cases

| Scenario                                             | Recommended target                            | Why                                                                                                                                                          |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Blogs, news sites, marketing pages                   | Next.js App Router, RSC + SSR streaming       | Crawlers and social previews see fully rendered HTML on the first request, Core Web Vitals stay healthy, content ships before the JS bundle finishes loading |
| Storefronts, product listings, ecommerce             | Next.js App Router, RSC + SSR streaming       | Product and category pages need to be indexed and to load fast for conversion, same reasoning as above                                                       |
| Dashboards, admin panels, internal tools behind auth | Next.js SSR/RSC or the Vite SPA, either works | Nothing behind a login wall gets crawled, so SEO is not a factor, pick whichever fits your infrastructure                                                    |
| A companion mobile app for any of the above          | React Native, same component tree             | Components, Tailwind class names, hooks and business logic carry over as-is, only navigation and the native shell differ                                     |

For anything where search engines and social previews matter, blogs, news sites, marketing pages, ecommerce storefronts and product listings, use the Next.js App Router target with RSC and SSR streaming. Content-heavy pages render fully on the server, so crawlers see real HTML on the first request instead of an empty shell waiting for JavaScript. SSR streaming means the page starts painting before every server call finishes, so Core Web Vitals stay healthy even on data-heavy pages. useFetch and useFetchGraphQL hydrate server data straight into client components, so there is no second client-side fetch and no loading flash stacked on top of what the server already rendered.

Because the same component tree also targets React Native, once a product is built this way, adding a companion mobile app is a fraction of the usual effort. The Tailwind class names, the components, the data-fetching hooks and most of the business logic carry over as-is, only navigation and the native shell differ. A team that would otherwise need to build and maintain a second app from scratch instead reuses the majority of what already exists, so a mobile release becomes a realistic addition instead of a separate project.

For anything that lives behind authentication, dashboards, admin panels, internal tools, SaaS control panels, none of this is crawled, so SEO stops being a factor. Here both targets are equally valid: keep using the Next.js App Router with SSR/RSC if you want one framework and one deployment for the whole product, marketing pages and app alike, or switch to the plain Vite SPA if you would rather ship a fully client-rendered app with no server-rendering cost, deployable straight to a static host or CDN. The component code, styling and hooks stay the same either way, the choice is purely about infrastructure and deployment preference, not framework capability.

## Quick start

```sh
pnpm create rntwsc-app my-app
# or: npm create rntwsc-app my-app
# or: npx create-rntwsc-app my-app

cd my-app
pnpm i

# web (Next.js, turbopack)
cd web
pnpm start

# native (React Native, Metro)
cd app
pnpm start
pnpm android
```

See [getting-started.md](docs/getting-started.md) for the full walkthrough, or [existing-app.md](docs/existing-app.md) to add rntwsc into an app you already have.

## Docs

- [Getting started](docs/getting-started.md)
- [Adding rntwsc to an existing app](docs/existing-app.md)
- [Components: built-in component library](docs/components.md)
- [Tailwind: class names, cva, selectors, extras](docs/tailwind.md)
- [Browser variant: resolver level browser resolution](docs/browser-variant.md)
- [Async components: server to sync transpilation](docs/async-components.md)
- [Hydration: fetch and graphql, client nav, refetch](docs/hydration.md)
- [Navigation: routes, Link, useRoute](docs/navigation.md)
- [Theme: built-in themes, custom theme](docs/theme.md)
- [Dark mode: built-in dark mode support](docs/dark-mode.md)
- [I18n: usage, namespaces, languages, switcher](docs/i18n.md)
- [Image, SVG, HTML semantics](docs/assets.md)

## Contributing

See [docs/contribution](docs/contribution/README.md) for the internal architecture, build process, and dev workflow.

## License: MIT

Contact: [nam@namnm.com](mailto:nam@namnm.com)
