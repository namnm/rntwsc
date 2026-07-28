import { binRequireResolve, cmd, exec } from '#/devtools/exec'
import { resolvePath } from '#/devtools/path'

export const prettierCmd = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('#/devtools/prettier', undefined, repoRoot),
    args: [
      ['--log-level', 'error'],
      ['--config', await resolvePath(repoRoot, 'prettier.config.js')],
      ['--write'],
      //
    ],
    target,
  })

export const prettier = (repoRoot: string, target = repoRoot) =>
  prettierCmd(target, repoRoot).then(exec)
