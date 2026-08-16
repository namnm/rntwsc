<!-- START doctoc -->

- [Build and release packages](#build-and-release-packages)
  - [Running](#running)
  - [What it does (packages/devtools/build-dist/index.ts)](#what-it-does-packagesdevtoolsbuild-distindexts)
  - [Consuming the published package](#consuming-the-published-package)
  - [dist output structure](#dist-output-structure)
  - [Build order](#build-order)
  - [Building and testing the create-rntwsc-app CLI](#building-and-testing-the-create-rntwsc-app-cli)

<!-- END doctoc -->

# Build and release packages

Build script for distributing the framework modules as standalone packages without publishing to npm. Consumers install via a pnpm git URL with a path selector.

Each module is a collection of sub packages (for example core/tw, devtools/eslint). The build merges them into one installable package per module.

## Running

```sh
pnpm dist
```

## What it does (packages/devtools/build-dist/index.ts)

1. Copy - copies every ts, tsx, js, svg, css, scss, and patch file from packages/<module> into dist/<module>, as is. No compilation happens at any point - consumers get the same source this repo builds from. Test files are excluded. Extra root files a module needs (for example tsconfig.base.json for devtools) are copied in too.

2. Generate CSS extract variables json - runs the css-extract-variables generator against the freshly copied dist output, producing a local.json sibling next to every extract-variables.css or extract-variables.scss file. Theme files import that json instead of the stylesheet directly.

3. Generate browser variants json - scans the dist output of every module for files ending in browser.ts, browser.tsx, or an index.browser file, and writes a flat specifier map (for example @rntwsc/core/dark-mode mapped to @rntwsc/core/dark-mode/index.browser) to dist/devtools/next-config/browser-variants.json. A consuming app's next-config reads this file directly, so it can resolve the browser variant of a package installed from node_modules without globbing into node_modules itself.

4. Write package.json - merges dependencies and peerDependencies from every sub package's own package.json into one, adds the other module as a peerDependency pointing at the same git tarball and version (devtools depends on core this way), sets the package type to commonjs, and writes an explicit exports map. The exports map has one entry per source file plus a directory entry for every folder with an index file. A file suffixed native gets a react-native condition; everything else falls under default. Also fills in the standard npm metadata fields - description, keywords, license, repository, homepage, bugs are hardcoded in writePackageJson; author is read from the root package.json's own author field.

5. Rewrite imports - rewrites every #/ alias import inside the dist ts, tsx, js, css, and scss files into a @rntwsc/ scoped import (for example #/core/tw becomes @rntwsc/core/tw). An import into the other module is only allowed if that module is declared as a cross dependency for the current one; anything else fails the build with a list of unresolved imports.

6. Bundle docs - copies the top-level docs/*.md files (not docs/contribution/ or docs/todo.md, which are maintainer-only) into dist/docs/. A consumer installing rntwsc gets these docs alongside the source in node_modules, so a coding agent or IDE working in the consumer's own project can read them locally instead of needing a live fetch to GitHub. README.md's own links still point at GitHub (see readReadmeWithGithubLinks) - the bundled docs/ folder is a separate, additive copy, not a replacement for that.

## Consuming the published package

Consumers get plain ts, tsx, and js source, not compiled output - the app's own bundler is expected to transpile it the same way it transpiles first party source. transpilePackages in next-config, and the @rntwsc special case in babel-config's should-transpile, exist for exactly this: they tell webpack, Turbopack, and babel to run their normal pipeline against @rntwsc/* even though it lives inside node_modules.

Playground apps dogfood the real published package (not the live monorepo source in packages/core). Only the root package.json declares a `rntwsc` dependency, pinned to a specific commit - the playground package.json files (app, turbopack, webpack, vite) do not declare it at all, and resolve it via Node's normal upward node_modules walk up to root's single copy. See contribution/vite.md's "Consumers of a published rntwsc package" for why a single copy matters.

Because of this pin, a change to packages/core or packages/devtools is invisible to playground/tsc/e2e until the full publish cycle runs: bump `dist.version` in root package.json, `pnpm dist`, `make publish`, paste the new commit SHA into root package.json's `rntwsc` dependency, then `pnpm dedupe` (not `pnpm install` - only root's package.json changed). There is currently no local-link/workspace-alias shortcut for iterating on core changes against the playground apps.

## dist output structure

```
dist/
  core/
    package.json        depends on nothing
    tw/tw.ts
    components/...
    svg-icons/*.svg      copied
    themes/*.scss        copied
    themes/*.local.json  generated by step 2
    ...
  devtools/
    package.json         depends on @rntwsc/core
    next-config/browser-variants.json   generated by step 3
    eslint/index.ts
    babel-plugin-tw/...
    ...
```

## Build order

devtools depends on core; core depends on nothing. The copy, css-vars, and package.json steps still run in parallel across both modules (Promise.all), since each only reads and writes its own dist/<module> output - the dependency only matters for what ends up in each module's own package.json, not for the order the build steps run in.

## Building and testing the create-rntwsc-app CLI

`pnpm cli` (packages/cli/build-cli/index.ts) copies packages/cli/create-rntwsc-app's bin, src, and .templates into dist-cli/, publishable to npm as `create-rntwsc-app` (unlike rntwsc itself, this package is real npm-registry-published, since `npm create`/`pnpm create` resolve `create-<name>` from the registry). dist-cli/package.json's own `version` field must stay valid semver for that reason.

rntwsc is git-tarball only, never on npm, so a real `github:namnm/rntwsc#<commit>` spec is the only thing that actually installs. create-rntwsc-app's default `--rntwsc-version` still bakes in a bare semver (dist-cli/package.json's own `version`) rather than that spec, on purpose - the semver default is what a real npm publish of rntwsc would eventually need, and changing it is a separate decision from this CLI. Until then, generating with no override produces a project whose `pnpm install` fails - pass `--rntwsc-version github:namnm/rntwsc#<commit>` explicitly. e2e-create-rntwsc-app always does this, reading the spec from root package.json's own `dependencies.rntwsc`.

Three layers of test cover this CLI, each catching what the layer below can't:

- packages/cli/create-rntwsc-app/src/generate.test.ts - unit tests the copy/token-substitution engine against synthetic fake templates, not the real ones.
- packages/cli/create-rntwsc-app/src/real-templates.test.ts - generates a project from the actual .templates + fullManifest, then statically checks every generated file: no leftover `__TOKEN__` placeholders, every `@/` import resolves to a real file, every `t('key')` call has a matching key in every locale. Fast, no network - this is what would have caught a template file missing from manifest.ts (e.g. app.native.tsx importing `@/root-navigation` with no root-navigation.tsx entry anywhere in the manifest).
- packages/cli/e2e-create-rntwsc-app (run via `pnpm e2e:create-rntwsc-app`) - builds the real dist-cli output, runs its bin entry to generate a project into a temp dir exactly like a real user would (`pnpm dedupe`, `pnpm fmt`, `git init` all run for real), then runs `pnpm tsc` and a real `next build` inside it. Slow and needs network (installs react-native, next, etc. for real) - not part of `pnpm fmt` or `pnpm test`, run this before a release or after touching create-rntwsc-app's templates or manifest.
