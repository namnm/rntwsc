import { path } from '@/devtools/path'

export const getGitignorePath = (repoRoot: string) =>
  path.join(repoRoot, './.gitignore')
