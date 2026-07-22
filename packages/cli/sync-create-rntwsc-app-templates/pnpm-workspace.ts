import { parse, stringify } from 'yaml'

import { fs } from '@/devtools/fs'
import { path } from '@/devtools/path'
import type { StrMap } from '@/libs/utility-types'

type Workspace = {
  allowBuilds?: StrMap<boolean>
  overrides?: StrMap<string>
  patchedDependencies?: StrMap<string>
}

const cliRoot = 'packages/cli/create-rntwsc-app'
const templateRoot = `${cliRoot}/templates/root`

export const syncTemplatePnpmWorkspace = async (repoRoot: string) => {
  const rootWorkspaceRaw = await fs.readFile(
    path.join(repoRoot, 'pnpm-workspace.yaml'),
    'utf8',
  )
  const rootWorkspace = parse(rootWorkspaceRaw) as Workspace
  const patchedDependencies = rootWorkspace.patchedDependencies || {}

  const patchesDestDir = path.join(repoRoot, templateRoot, 'patches')
  await fs.remove(patchesDestDir)
  await Promise.all(
    Object.values(patchedDependencies).map(rel =>
      fs.copy(path.join(repoRoot, rel), path.join(repoRoot, templateRoot, rel)),
    ),
  )

  const templateWorkspace: Workspace & { packages: string[] } = {
    packages: ['./app', './web'],
    allowBuilds: rootWorkspace.allowBuilds,
    overrides: rootWorkspace.overrides,
    patchedDependencies,
  }
  await fs.outputFile(
    path.join(repoRoot, templateRoot, 'pnpm-workspace.yaml'),
    stringify(templateWorkspace, {
      singleQuote: true,
    }),
  )
}
