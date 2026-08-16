import { toAlias } from '#/devtools/babel-config/get-alias'
import type { StrMap } from '#/libs/utility-types'

// e.g. variant 'browser' matches both foo.browser.ts and the index.browser.ts
// special case, which also aliases the containing dir.
export const variantRegexes = (variant: string) => ({
  index: new RegExp(`\\/index\\.${variant}\\.[jt]sx?$`),
  plain: new RegExp(`\\.${variant}\\.[jt]sx?$`),
})

// Builds a `{ '#/core/foo': '/abs/path/to/foo.<variant>.ts' }`-shaped map from
// every path the caller's own glob finds. Shared by next-config and
// vite-config - see contribution/vite.md's "Web variant resolution" section.
export const variantResolveAlias = (
  alias: StrMap<string>,
  variant: string,
  files: string[],
): StrMap<string> => {
  const { index: indexRegex, plain: plainRegex } = variantRegexes(variant)
  const out: StrMap<string> = {}
  for (const abs of files) {
    const isIndex = indexRegex.test(abs)
    if (!isIndex && !plainRegex.test(abs)) {
      continue
    }
    const base = abs.replace(isIndex ? indexRegex : plainRegex, '')
    const key = toSpecifier(alias, base)
    if (!key) {
      continue
    }
    out[key] = abs
    if (isIndex) {
      out[`${key}/index`] = abs
    }
  }
  return out
}

const toSpecifier = (
  alias: StrMap<string>,
  base: string,
): string | undefined => {
  try {
    return toAlias(alias, `${base}.ts`)
  } catch {
    // file is not reachable through any known alias root, skip it
    return undefined
  }
}
