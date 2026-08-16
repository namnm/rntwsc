> Read [README](README.md) and [docs/contribution](docs/contribution/README.md) to find relevant documentation for your task if you are dont have enough context.

# Coding Conventions & Formattings

- Use `pnpm dedupe` instead of `pnpm install` to install dependencies.
- Run `pnpm fmt` to lint, fix any warning or error arises. If an eslint rule can not be fixed, try to add `// eslint-disable-next-line some-rule` or `/* eslint-disable some-rule */` for the whole file.
- Run `pnpm tsc` to check for typescript errors across the project and `pnpm test` and `pnpm e2e` to verify all tests before moving forward.

- Always use English in all code, comments, and documentation.
- Chat responses are in Vietnamese with proper diacritics.

- Do not write long comments in code. 1-2 lines are good, be concise, focus, dev friendly.
- If an explanation genuinely needs more than 1-2 lines, put it in a doc under docs/ or docs/contribution/ and leave a short comment referencing it, e.g. `// see contribution/vite.md`.

- No parenthetical-aside comments or docs, e.g. `// does X (because Y, in case Z)`. State the one thing that matters, not a main clause plus a bolted-on explanation.

- Use plain Markdown only. Do not write styled markdown such as bold or italic, just regular texts, paragraphs, code block, table.

- Code, comments, documentation must use ASCII-only content unless quoting external source verbatim. No decorative Unicode borders, box-drawing characters, or special symbols. Exception: Vietnamese text in docs/ markdown prose may use proper Vietnamese diacritics, since these are typed normally via a Vietnamese input method and carry real meaning - dropping them makes Vietnamese genuinely ambiguous, unlike stripping accents in other languages. The banned characters below: dashes, arrows, quotes, bullets, math symbols, emoji, misc, etc.. still banned even in Vietnamese docs. Always write English docs unless explicit command to writer others.

Banned examples:

| Category | Banned characters                |
| -------- | -------------------------------- |
| Dashes   | en dash, em dash, horizontal bar |
| Arrows   | any unicode arrows               |
| Quotes   | smart quotes, curly apostrophes  |
| Bullets  | bullet, triangle, diamond        |
| Math     | multiplication, division, minus  |
| Emoji    | all emoji without exception      |
| Misc     | ellipsis, checkmark, copyright   |

Use instead:

- Dashes: plain hyphen-minus -
- Arrows: -> or <- or => or <= two ASCII chars
- Quotes: straight double quotes " or straight single quotes '
- Bullets: plain hyphen - or asterisk \* or plus +
- Math: use plain ASCII operators \*, /, -
- Ellipsis: two plain periods ..
- Copyright: (c)
- Etc..

<!-- START doctoc -->
<!-- END doctoc -->
