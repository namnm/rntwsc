# dist

Build script for distributing the 4 framework modules as standalone packages
without publishing to npm. Consumers install via pnpm git URL with a path selector.

## Modules

| Module              | Package            | Deps                 |
| ------------------- | ------------------ | -------------------- |
| `packages/shared`   | `@rntwsc/shared`   | -                    |
| `packages/nodejs`   | `@rntwsc/nodejs`   | shared               |
| `packages/core`     | `@rntwsc/core`     | shared, nodejs       |
| `packages/devtools` | `@rntwsc/devtools` | shared, nodejs, core |

Each module is a collection of sub-packages (e.g. `nodejs/exec`, `nodejs/log`).
The build merges them into one installable package.

## Running

```sh
pnpm dist
```

## What it does per module

1. **Compile** - generates a temp `tsconfig.<mod>.dist.local.json` then runs tsc:
   - Output: ESM syntax (`module: esnext`, `moduleResolution: bundler`) - preserves
     estree for tree shaking in Metro/webpack. `type: commonjs` in the emitted
     package.json keeps imports extension-free and skips the `exports` map.
     Node.js users need a transpiler (ts-node/tsx); bundler users get it for free.
   - Declarations: `.d.ts` alongside each `.js`

2. **Copy assets** - copies non-TS files tsc ignores: `.svg`, `.css`, `.scss`

3. **Rewrite imports** in all `.js` and `.d.ts` output files:
   - `@/<same-mod>/sub` -> relative path (e.g. `../exec`)
   - `@/<other-mod>/sub` -> `@rntwsc/<other-mod>/sub`

4. **Write package.json** - merges `dependencies` and `peerDependencies` from
   all sub-package `package.json` files, adds cross-module sibling deps

## dist/ output structure

```
dist/
  shared/       <- @rntwsc/shared
    package.json
    lodash/index.js + index.d.ts
    ts-utils/index.js + index.d.ts
    ...
  nodejs/       <- @rntwsc/nodejs
    package.json  (depends on @rntwsc/shared)
    exec/index.js + index.d.ts
    log/index.js + index.d.ts
    ...
  core/           <- @rntwsc/core
    package.json  (depends on @rntwsc/shared, @rntwsc/nodejs)
    core/...
    components/...
    svg-icons/*.svg (copied)
    themes/*.scss (copied)
    ...
  devtools/     <- @rntwsc/devtools
    package.json  (depends on @rntwsc/shared, @rntwsc/nodejs, @rntwsc/core)
    eslint/index.js + index.d.ts
    babel-plugin-tw/...
    ...
```

## tsconfig approach

Each module gets a temporary `tsconfig.<mod>.dist.local.json` (deleted after build).

Key design decisions:

- **No broad `@/*` fallback** - prevents TypeScript from following unknown aliases into source files and emitting stray `.d.ts` next to source.

- **Cross-module paths point to `dist/<dep>/`** - TypeScript reads already-compiled
  `.d.ts` files for type info, not source. This is why build order matters
  (shared -> nodejs -> core -> devtools).

## Build order dependency

```
shared (no deps)
  -> nodejs (needs dist/shared/)
  -> core     (needs dist/shared/, dist/nodejs/)
     -> devtools (needs dist/shared/, dist/nodejs/, dist/core/)
```
