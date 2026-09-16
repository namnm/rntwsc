import { binRequireResolve, cmd, exec } from 'rntwsc/devtools/exec'
import { resolvePath } from 'rntwsc/devtools/path'

export const prettierCmd = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('rntwsc/devtools/prettier', undefined, repoRoot),
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
