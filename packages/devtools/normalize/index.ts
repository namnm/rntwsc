import { normalizeGitignore } from '@/devtools/normalize/gitignore'
import { normalizePackageJson } from '@/devtools/normalize/package-json'
import { normalizeTsconfigJson } from '@/devtools/normalize/tsconfig-json'

export const normalize = (repoRoot: string) =>
  Promise.all([
    normalizePackageJson(repoRoot),
    normalizeGitignore(repoRoot).then(() => normalizeTsconfigJson(repoRoot)),
  ])
