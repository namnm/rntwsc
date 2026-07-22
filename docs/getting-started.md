<!-- START doctoc -->

- [Getting Started](#getting-started)
  - [Options](#options)
  - [Adding rntwsc to an existing app](#adding-rntwsc-to-an-existing-app)

<!-- END doctoc -->

# Getting Started

Scaffold a new project with the CLI:

```sh
pnpm create rntwsc-app my-app
# or: npm create rntwsc-app my-app
# or: npx create-rntwsc-app my-app
```

This generates a small pnpm workspace: an `app/` project (React Native, Metro) and a `web/`
project (Next.js, Turbopack), sharing one `src/` tree.

```sh
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

## Options

```
create-rntwsc-app <project-directory> [options]

  --package-name <id>    Android package / iOS bundle id (default: derived from project name)
  --rntwsc-version <v>   override the rntwsc version pin (default: baked-in current version)
  -h, --help             show this message
```

## Adding rntwsc to an existing app

See [Adding rntwsc to an existing app](existing-app.md).
