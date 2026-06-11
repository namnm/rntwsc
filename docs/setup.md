# Setup

Install the packages by pinning to a commit hash on the `dist` branch:

```json
{
  "dependencies": {
    "@rntwsc/shared": "github:namnm/rntwsc#<hash>&path:shared",
    "@rntwsc/nodejs": "github:namnm/rntwsc#<hash>&path:nodejs",
    "@rntwsc/rn": "github:namnm/rntwsc#<hash>&path:rn",
    "@rntwsc/devtools": "github:namnm/rntwsc#<hash>&path:devtools"
  }
}
```

Only install what you need. Dependencies:

- `shared`: none
- `nodejs`: `shared`
- `rn`: `shared`
- `devtools`: all

## Packages

| Package            | Contents                                               |
| ------------------ | ------------------------------------------------------ |
| `@rntwsc/shared`   | Shared utilities (lodash wrappers, ts-utils)           |
| `@rntwsc/nodejs`   | Node.js utilities (exec, log)                          |
| `@rntwsc/rn`       | React Native components, core hooks, svg-icons, themes |
| `@rntwsc/devtools` | Babel plugins, ESLint rules, build config              |

## Runtime requirement

Register `tsconfig-paths` at runtime so path aliases resolve correctly:

```ts
// at the top of your entry point, or via node -r flag
import 'tsconfig-paths/register'
```

## VS Code Intellisense

Add to `.vscode/settings.json` for Tailwind class name autocomplete in `tw`, `cva`, and `clsx` calls:

```json
{
  "tailwindCSS.classFunctions": ["tw", "cva", "clsx"]
}
```

## Updating

To update to a newer version, get the latest commit hash from the `dist` branch and bump the hash in `package.json`, then run `pnpm install`.
