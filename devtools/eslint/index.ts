import { binRequireResolve, cmd, exec } from 'rntwsc/devtools/exec'
import { resolvePath } from 'rntwsc/devtools/path'

export const eslintCmd = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('rntwsc/devtools/eslint', undefined, repoRoot),
    args: [
      ['--config', await resolvePath(repoRoot, 'eslint.config.js')],
      ['--fix'],
      //
    ],
    argsJoinUsingSpace: true,
    target,
  })

export const eslint = (repoRoot: string, target = repoRoot) =>
  eslintCmd(target, repoRoot).then(exec)
