import type { ClassNameSingle } from '#/core/tw/class-name'

type FnTaggedTemplateLiteral = (
  strings: TemplateStringsArray,
  ...values: never[]
) => ClassNameSingle

// Only runs when babel-plugin-tw's build-time transform is skipped, e.g.
// unit tests - see tailwind.md Core usage
export const tw: FnTaggedTemplateLiteral = strings => strings.join('')
