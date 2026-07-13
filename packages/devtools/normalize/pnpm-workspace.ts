import { parse } from 'yaml'

import type { StrMap } from '@/core/ts-utils'
import { fs } from '@/devtools/fs'
import { path } from '@/devtools/path'

export type PnpmWorkspace = {
  overrides?: StrMap<string>
}

export const pnpmWorkspace = async (repoRoot: string) => {
  const p = path.join(repoRoot, 'pnpm-workspace.yaml')
  const f = await fs.readFile(p, 'utf8')
  return parse(f) as PnpmWorkspace
}

export const pnpmWorkspaceSync = (repoRoot: string) => {
  const p = path.join(repoRoot, 'pnpm-workspace.yaml')
  const f = fs.readFileSync(p, 'utf8')
  return parse(f) as PnpmWorkspace
}
