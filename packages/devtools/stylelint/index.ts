import { binRequireResolve, cmd, exec } from '#/devtools/exec'
import { getGitignorePath } from '#/devtools/gitignore'
import { path, resolvePath } from '#/devtools/path'

export const stylelintCmd = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('#/devtools/stylelint', undefined, repoRoot),
    args: [
      ['--ignore-path', getGitignorePath(repoRoot)],
      ['--config-basedir', __dirname],
      ['--config', await resolvePath(repoRoot, 'stylelint.config.js')],
      ['--fix'],
      //
    ],
    target: path.join(target, './**/*.{css,scss,less}'),
  })

export const stylelint = (repoRoot: string, target = repoRoot) =>
  stylelintCmd(target, repoRoot).then(exec)
