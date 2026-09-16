<!-- START doctoc -->

- [Adding rntwsc to an Existing App](#adding-rntwsc-to-an-existing-app)
  - [VS Code Intellisense](#vs-code-intellisense)

<!-- END doctoc -->

# Adding rntwsc to an Existing App

TODO: document how to add rntwsc into an existing Next.js and/or React Native app, later.

## VS Code Intellisense

A generated project already includes `.vscode/settings.json` with Tailwind class name
autocomplete configured. If you are wiring this up by hand, add:

```json
{
  "tailwindCSS.classFunctions": ["tw", "cva", "clsx"]
}
```
