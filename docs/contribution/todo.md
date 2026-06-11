# Docs todo

## Missing docs

- **Theme** - no docs on how dark mode works, how to switch themes, how to add a custom theme. The 10 built-in themes are mentioned in README but undocumented.
- **Development workflow** - no docs on how to start the playground (RN + web), run tests, or build for production.
- **Adding an SVG icon** - `docs/assets.md` covers usage but not how to add a new icon to `packages/rn/svg-icons/`.
- **Polyfill system** - no docs on what platform polyfills exist or where to add new ones (`playground/app/src/polyfill/`).

## Gaps in existing docs

- **components.md**: no minimal end-to-end example showing a new component from scratch (file + playground + route + nav).
- **tailwind.md**: `runtimeStyle` is documented but its use case is unclear - add a concrete example of when it's actually needed.
- **rsc-ssr.md**: no guidance on when to create a `.client` file vs keep server-only. The decision rule is implicit.
- **navigation.md**: `RoutesData` is currently empty - clarify it is only needed when a route has typed params, and show the actual query access pattern.
- **i18n.md**: the `nativeName` field appears in the language switcher UI but is not explained in the add-a-language step.
