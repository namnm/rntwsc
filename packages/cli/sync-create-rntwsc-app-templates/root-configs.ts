import { fs } from '#/devtools/fs'
import { path } from '#/devtools/path'

const templateRoot = 'packages/cli/create-rntwsc-app/.templates/root'

const files = [
  {
    real: 'devtools.js',
    template: 'devtools.js',
  },
  {
    real: 'eslint.config.js',
    template: 'eslint.config.js',
  },
  {
    real: 'prettier.config.js',
    template: 'prettier.config.js',
  },
  {
    real: 'stylelint.config.js',
    template: 'stylelint.config.js',
  },
  {
    real: 'tailwind.config.js',
    template: 'tailwind.config.js',
  },
]

const aliasRegex = /(['"`])(#\/[^'"`]+)\1/g
const flattenedModules = new Set(['core'])

const rewriteImportPath = (importPath: string): string => {
  if (importPath === '#/cli/devtools') {
    return 'rntwsc/devtools'
  }
  const withoutAt = importPath.slice(2)
  const slashIdx = withoutAt.indexOf('/')
  const mod = slashIdx === -1 ? withoutAt : withoutAt.slice(0, slashIdx)
  const rest = slashIdx === -1 ? '' : withoutAt.slice(slashIdx)
  const prefix = flattenedModules.has(mod) ? '' : mod
  return prefix ? `rntwsc/${prefix}${rest}` : `rntwsc${rest}`
}

const rewriteAliases = (content: string): string =>
  content.replace(
    aliasRegex,
    (_m, q: string, importPath: string) =>
      `${q}${rewriteImportPath(importPath)}${q}`,
  )

const dropAliasOption = (content: string): string =>
  content.replace(/[ \t]*alias: true,\n/, '')

export const syncTemplateRootConfigs = async (repoRoot: string) => {
  const dir = path.join(repoRoot, templateRoot)
  await Promise.all(
    files.map(async ({ real, template }) => {
      const content = await fs.readFile(path.join(repoRoot, real), 'utf8')
      const rewritten = dropAliasOption(rewriteAliases(content))
      await fs.outputFile(path.join(dir, template), rewritten)
    }),
  )
}
