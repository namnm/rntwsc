import { normalizeGitignore } from 'rntwsc/devtools/normalize/gitignore'
import { normalizePackageJson } from 'rntwsc/devtools/normalize/package-json'
import { normalizeTsconfigJson } from 'rntwsc/devtools/normalize/tsconfig-json'

export const normalize = (repoRoot: string) =>
  Promise.all([
    normalizePackageJson(repoRoot),
    normalizeGitignore(repoRoot).then(() => normalizeTsconfigJson(repoRoot)),
  ])
