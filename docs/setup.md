# Setup

Install the packages by pinning to a commit hash on the `dist` branch:

```json
{
  "dependencies": {
    "@twrnsc/shared": "github:namnm/twrnsc#<hash>&path:shared",
    "@twrnsc/nodejs": "github:namnm/twrnsc#<hash>&path:nodejs",
    "@twrnsc/rn": "github:namnm/twrnsc#<hash>&path:rn",
    "@twrnsc/devtools": "github:namnm/twrnsc#<hash>&path:devtools"
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
| `@twrnsc/shared`   | Shared utilities (lodash wrappers, ts-utils)           |
| `@twrnsc/nodejs`   | Node.js utilities (exec, log)                          |
| `@twrnsc/rn`       | React Native components, core hooks, svg-icons, themes |
| `@twrnsc/devtools` | Babel plugins, ESLint rules, build config              |

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
