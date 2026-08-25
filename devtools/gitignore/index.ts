import { path } from 'rntwsc/devtools/path'

export const getGitignorePath = (repoRoot: string) =>
  path.join(repoRoot, './.gitignore')
