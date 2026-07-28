import { toAlias } from '#/devtools/babel-config/get-alias'
import type { StrMap } from '#/libs/utility-types'

const indexBrowserRegex = /\/index\.browser\.[jt]sx?$/
const browserRegex = /\.browser\.[jt]sx?$/
const nodeModulesPkgRegex = /(?:^|\/)node_modules\/(@rntwsc\/[^/]+)\/(.+)$/

const toSpecifier = (
  alias: StrMap<string>,
  base: string,
): string | undefined => {
  const nm = nodeModulesPkgRegex.exec(base)
  if (nm) {
    const [, pkg, rel] = nm
    return `${pkg}/${rel}`
  }
  try {
    return toAlias(alias, `${base}.ts`)
  } catch {
    // file is not reachable through any known alias root, skip it
    return undefined
  }
}

export const browserResolveAlias = (
  alias: StrMap<string>,
  browsers: string[],
): StrMap<string> => {
  const out: StrMap<string> = {}
  for (const abs of browsers) {
    const isIndex = indexBrowserRegex.test(abs)
    if (!isIndex && !browserRegex.test(abs)) {
      continue
    }
    const base = abs.replace(isIndex ? indexBrowserRegex : browserRegex, '')
    const key = toSpecifier(alias, base)
    if (!key) {
      continue
    }
    out[key] = isIndex ? `${key}/index.browser` : `${key}.browser`
  }
  return out
}
