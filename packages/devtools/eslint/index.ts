import { binRequireResolve, cmd, exec } from '#/devtools/exec'
import { resolvePath } from '#/devtools/path'

export const eslintCmd = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('#/devtools/eslint', undefined, repoRoot),
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
