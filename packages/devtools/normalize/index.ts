import { normalizeGitignore } from '@/devtools/normalize/gitignore'
import { normalizePackageJson } from '@/devtools/normalize/package-json'
import { normalizeTsconfigJson } from '@/devtools/normalize/tsconfig-json'

export const run = () =>
  Promise.all([
    normalizePackageJson(),
    normalizeGitignore().then(normalizeTsconfigJson),
  ])
