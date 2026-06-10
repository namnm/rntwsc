# dist

Build script for distributing the 4 framework modules as standalone packages
without publishing to npm. Consumers install via pnpm git URL with a path selector.

## Modules

| Module              | Package            | Deps               |
| ------------------- | ------------------ | ------------------ |
| `packages/shared`   | `@twrnsc/shared`   | -                  |
| `packages/nodejs`   | `@twrnsc/nodejs`   | shared             |
| `packages/rn`       | `@twrnsc/rn`       | shared, nodejs     |
| `packages/devtools` | `@twrnsc/devtools` | shared, nodejs, rn |

Each module is a collection of sub-packages (e.g. `nodejs/exec`, `nodejs/log`).
The build merges them into one installable package.

## Running

```sh
pnpm dist
```

Runs via `node -r ./devtools-register scripts/build` (ts-node transpilation, tsconfig-paths registered). No env var flags - scope, version, and module list are hardcoded in `scripts/build.ts`.

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
   - `@/<other-mod>/sub` -> `@twrnsc/<other-mod>/sub`

4. **Write package.json** - merges `dependencies` and `peerDependencies` from
   all sub-package `package.json` files, adds cross-module sibling deps

## dist/ output structure

```
dist/
  shared/       <- @twrnsc/shared
    package.json
    lodash/index.js + index.d.ts
    ts-utils/index.js + index.d.ts
    ...
  nodejs/       <- @twrnsc/nodejs
    package.json  (depends on @twrnsc/shared)
    exec/index.js + index.d.ts
    log/index.js + index.d.ts
    ...
  rn/           <- @twrnsc/rn
    package.json  (depends on @twrnsc/shared, @twrnsc/nodejs)
    core/...
    components/...
    svg-icons/*.svg (copied)
    themes/*.scss (copied)
    ...
  devtools/     <- @twrnsc/devtools
    package.json  (depends on @twrnsc/shared, @twrnsc/nodejs, @twrnsc/rn)
    eslint/index.js + index.d.ts
    babel-plugin-tw/...
    ...
```

## Consumer setup

Add to `package.json` dependencies, pinning to a commit hash on the dist branch:

```json
{
  "dependencies": {
    "@twrnsc/shared": "github:org/repo#<hash>&path:shared",
    "@twrnsc/nodejs": "github:org/repo#<hash>&path:nodejs",
    "@twrnsc/rn": "github:org/repo#<hash>&path:rn",
    "@twrnsc/devtools": "github:org/repo#<hash>&path:devtools"
  }
}
```

And register tsconfig-paths at runtime (e.g. via `node -r tsconfig-paths/register`).

## tsconfig approach

Each module gets a temporary `tsconfig.<mod>.dist.local.json` (deleted after build).

Key design decisions:

- **No broad `@/*` fallback** - prevents TypeScript from following unknown aliases into source files and emitting stray `.d.ts` next to source.

- **Cross-module paths point to `dist/<dep>/`** - TypeScript reads already-compiled
  `.d.ts` files for type info, not source. This is why build order matters
  (shared -> nodejs -> rn -> devtools).

## Build order dependency

```
shared (no deps)
  -> nodejs (needs dist/shared/)
  -> rn     (needs dist/shared/, dist/nodejs/)
     -> devtools (needs dist/shared/, dist/nodejs/, dist/rn/)
```
