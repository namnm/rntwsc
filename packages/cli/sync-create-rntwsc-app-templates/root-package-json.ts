import { fs } from '@/devtools/fs'
import { path } from '@/devtools/path'
import type { StrMap } from '@/libs/utility-types'

type PackageJson = {
  scripts?: StrMap<string>
  devDependencies?: StrMap<string>
  [key: string]: unknown
}

const cliRoot = 'packages/cli/create-rntwsc-app'
const templatePath = `${cliRoot}/templates/root/package.template.json`

export const syncTemplateRootPackageJson = async (repoRoot: string) => {
  const absTemplatePath = path.join(repoRoot, templatePath)
  const [rootPkg, template] = await Promise.all([
    fs.readJson(path.join(repoRoot, 'package.json')) as Promise<PackageJson>,
    fs.readJson(absTemplatePath) as Promise<PackageJson>,
  ])

  template.devDependencies = {
    ...rootPkg.devDependencies,
  }

  await fs.outputJson(absTemplatePath, template, {
    spaces: 2,
  })
}
