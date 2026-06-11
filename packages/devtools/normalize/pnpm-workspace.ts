import { parse } from 'yaml'

import { repoRoot } from '@/nodejs/entrypoint/root'
import { fs } from '@/nodejs/fs'
import { path } from '@/nodejs/path'
import type { StrMap } from '@/shared/ts-utils'

export type PnpmWorkspace = {
  overrides?: StrMap<string>
}

export const pnpmWorkspace = async () => {
  const p = path.join(repoRoot, 'pnpm-workspace.yaml')
  const f = await fs.readFile(p, 'utf8')
  return parse(f) as PnpmWorkspace
}

export const pnpmWorkspaceSync = () => {
  const p = path.join(repoRoot, 'pnpm-workspace.yaml')
  const f = fs.readFileSync(p, 'utf8')
  return parse(f) as PnpmWorkspace
}
