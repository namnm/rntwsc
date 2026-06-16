# Getting Started

Install the packages by pinning to a tagged version or commit hash:

```json
{
  "dependencies": {
    "@rntwsc/shared": "github:namnm/rntwsc#<version>&path:shared",
    "@rntwsc/nodejs": "github:namnm/rntwsc#<version>&path:nodejs",
    "@rntwsc/core": "github:namnm/rntwsc#<version>&path:core",
    "@rntwsc/devtools": "github:namnm/rntwsc#<version>&path:devtools"
  }
}
```

## Packages

| Package            | Contents                                                   |
| ------------------ | ---------------------------------------------------------- |
| `@rntwsc/shared`   | Shared utils                                               |
| `@rntwsc/nodejs`   | Node.js utils                                              |
| `@rntwsc/core`     | React Native components, hooks, icons, themes..            |
| `@rntwsc/devtools` | Built in utils and configs: Babel, ESLint, NextJS, Metro.. |

## VS Code Intellisense

Add to `.vscode/settings.json` for Tailwind class name autocomplete:

```json
{
  "tailwindCSS.classFunctions": ["tw", "cva", "clsx"]
}
```
