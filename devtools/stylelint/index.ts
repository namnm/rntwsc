import { binRequireResolve, cmd, exec } from 'rntwsc/devtools/exec'
import { getGitignorePath } from 'rntwsc/devtools/gitignore'
import { path, resolvePath } from 'rntwsc/devtools/path'

export const stylelintCmd = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('rntwsc/devtools/stylelint', undefined, repoRoot),
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
