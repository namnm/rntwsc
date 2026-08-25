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
project (Next.js, Turbopack), sharing one `src/` tree. The home page ships with a working
Settings button (theme, dark mode, language, all wired to real state) - see
`src/components/settings-modal.tsx` for the ready-to-use pattern, drop `<SettingsButton />`
anywhere else you need it.

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
  --rntwsc-version <v>   override the rntwsc dependency pin (default: this CLI's own version
                          number). rntwsc is git-tarball only, not on npm yet, so pass a full
                          installable spec here, e.g. github:namnm/rntwsc#<commit>, or `pnpm i`
                          in the generated project will fail to resolve it.
  -h, --help             show this message
```

## Adding rntwsc to an existing app

See [Adding rntwsc to an existing app](existing-app.md).
