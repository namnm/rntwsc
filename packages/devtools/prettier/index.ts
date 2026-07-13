import { binRequireResolve, cmd, exec } from '@/devtools/exec'
import { resolvePath } from '@/devtools/path'

export const prettier = async (target: string, repoRoot: string) =>
  cmd({
    bin: await binRequireResolve('@/devtools/prettier', undefined, repoRoot),
    args: [
      ['--log-level', 'error'],
      ['--config', await resolvePath(repoRoot, 'prettier.config.js')],
      ['--write'],
      //
    ],
    target,
  })

export const run = (repoRoot: string, target = repoRoot) =>
  prettier(target, repoRoot).then(exec)
