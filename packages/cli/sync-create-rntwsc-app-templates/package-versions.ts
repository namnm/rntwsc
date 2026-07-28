import { fs } from '#/devtools/fs'
import { path } from '#/devtools/path'
import type { StrMap } from '#/libs/utility-types'

type PackageJson = {
  dependencies?: StrMap<string>
  devDependencies?: StrMap<string>
}

const depKeys = ['dependencies', 'devDependencies'] as const

const syncVersions = async (templatePath: string, realPath: string) => {
  const [template, real] = await Promise.all([
    fs.readJson(templatePath) as Promise<PackageJson>,
    fs.readJson(realPath) as Promise<PackageJson>,
  ])

  for (const key of depKeys) {
    const realDeps = real[key]
    if (!realDeps) {
      continue
    }
    const rntwscPin = template[key]?.rntwsc
    template[key] = {
      ...realDeps,
      ...(rntwscPin
        ? {
            rntwsc: rntwscPin,
          }
        : {}),
    }
  }

  await fs.outputJson(templatePath, template, {
    spaces: 2,
  })
}

export const syncTemplatePackageVersions = async (repoRoot: string) => {
  const cliRoot = path.join(
    repoRoot,
    'packages/cli/create-rntwsc-app/.templates',
  )
  await Promise.all([
    syncVersions(
      path.join(cliRoot, 'app/package.template.json'),
      path.join(repoRoot, 'playground/app/package.json'),
    ),
    syncVersions(
      path.join(cliRoot, 'web/package.template.json'),
      path.join(repoRoot, 'playground/turbopack/package.json'),
    ),
  ])
}
