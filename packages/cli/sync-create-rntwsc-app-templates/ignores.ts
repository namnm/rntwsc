import {
  extraDockerignore,
  extraPrettierignore,
  getNormalizedGitignore,
  writeManagedFile,
} from '#/devtools/normalize/gitignore'
import { path } from '#/devtools/path'

const templateRoot = 'packages/cli/create-rntwsc-app/.templates/root'

export const syncTemplateIgnores = async (repoRoot: string) => {
  const normalized = await getNormalizedGitignore(repoRoot)
  const dir = path.join(repoRoot, templateRoot)

  await Promise.all([
    writeManagedFile(path.join(dir, '.gitignore.template'), normalized, ''),
    writeManagedFile(
      path.join(dir, '.prettierignore'),
      normalized,
      extraPrettierignore,
    ),
    writeManagedFile(
      path.join(dir, '.dockerignore'),
      normalized,
      extraDockerignore,
    ),
  ])
}
