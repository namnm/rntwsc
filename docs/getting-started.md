# Getting Started

Install the packages by pinning to a tagged version or commit hash:

```json
{
  "dependencies": {
    "@rntwsc/core": "github:namnm/rntwsc#<version>&path:core"
  },
  "devDependencies": {
    "@rntwsc/devtools": "github:namnm/rntwsc#<version>&path:devtools"
  }
}
```

## Packages

| Package          | Contents                                                            |
| ---------------- | ------------------------------------------------------------------- |
| @rntwsc/core     | React Native components, hooks, icons, themes, and more             |
| @rntwsc/devtools | Built in utils and configs: Babel, ESLint, Next.js, Metro, and more |

## VS Code Intellisense

Add to .vscode/settings.json for Tailwind class name autocomplete:

```json
{
  "tailwindCSS.classFunctions": ["tw", "cva", "clsx"]
}
```
